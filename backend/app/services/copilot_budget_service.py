import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Tuple, Optional, Dict, Any
from app.config import settings

class CopilotBudgetService:
    """
    Production-grade, persistent SQLite-backed rate limiter, atomic token budgeter,
    and abuse prevention service for Cosmic Copilot Groq AI requests.
    """

    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or settings.COPILOT_DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        self._circuit_open_until = 0
        self._consecutive_failures = 0

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS daily_usage (
                    date_key TEXT PRIMARY KEY,
                    total_requests INTEGER DEFAULT 0,
                    input_tokens INTEGER DEFAULT 0,
                    output_tokens INTEGER DEFAULT 0,
                    active_reservations INTEGER DEFAULT 0,
                    active_tokens_reserved INTEGER DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS rolling_limits (
                    key TEXT PRIMARY KEY,
                    window_epoch INTEGER NOT NULL,
                    count INTEGER DEFAULT 0
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS abuse_blocks (
                    target_key TEXT PRIMARY KEY,
                    blocked_until INTEGER NOT NULL,
                    reason TEXT NOT NULL
                )
            """)
            conn.commit()

    @staticmethod
    def _today_utc() -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # =========================================================================
    # Circuit Breaker & Kill Switch
    # =========================================================================

    def is_ai_enabled(self) -> bool:
        return settings.COSMIC_AI_ENABLED and bool(settings.GROQ_API_KEY)

    def is_circuit_open(self) -> bool:
        now = time.time()
        if self._circuit_open_until > now:
            return True
        return False

    def record_groq_failure(self, status_code: int = 500):
        self._consecutive_failures += 1
        if self._consecutive_failures >= 3 or status_code == 429:
            # Trip circuit breaker for 60 seconds
            self._circuit_open_until = time.time() + 60.0

    def record_groq_success(self):
        self._consecutive_failures = 0
        self._circuit_open_until = 0

    # =========================================================================
    # Multi-Layer Rate Limiting
    # =========================================================================

    def check_rate_limits(self, session_id: str, client_ip: str) -> Tuple[bool, str, int]:
        """
        Check Anonymous Session, Client IP, and Global limits across minute & daily windows.
        Returns: (allowed: bool, reason: str, retry_after: int)
        """
        now = time.time()
        now_sec = int(now)
        current_minute = now_sec // 60
        today = self._today_utc()

        with self._get_connection() as conn:
            # 1. Check abuse blocks
            cursor = conn.execute(
                "SELECT blocked_until FROM abuse_blocks WHERE target_key IN (?, ?) AND blocked_until > ?",
                (f"ip:{client_ip}", f"session:{session_id}", now_sec)
            )
            blocked_row = cursor.fetchone()
            if blocked_row:
                retry_after = max(1, blocked_row["blocked_until"] - now_sec)
                return False, "Abuse prevention active. Please wait before retrying.", retry_after

            # Cleanup expired rolling windows (> 2 hours old)
            conn.execute("DELETE FROM rolling_limits WHERE window_epoch < ?", (current_minute - 120,))

            # Helper to check and increment window
            def check_and_inc(key: str, max_allowed: int, window_val: int, retry_secs: int) -> Optional[Tuple[bool, str, int]]:
                c = conn.execute("SELECT count, window_epoch FROM rolling_limits WHERE key = ?", (key,)).fetchone()
                if c and c["window_epoch"] == window_val:
                    if c["count"] >= max_allowed:
                        return False, "Rate limit reached. Please wait a moment.", retry_secs
                    conn.execute("UPDATE rolling_limits SET count = count + 1 WHERE key = ?", (key,))
                else:
                    conn.execute(
                        "INSERT INTO rolling_limits (key, window_epoch, count) VALUES (?, ?, 1) "
                        "ON CONFLICT(key) DO UPDATE SET window_epoch = excluded.window_epoch, count = 1",
                        (key, window_val)
                    )
                return None

            # A. Global RPM limit (15)
            res = check_and_inc("global:rpm", settings.COSMIC_AI_GLOBAL_RPM, current_minute, 60 - (now_sec % 60))
            if res:
                return res

            # B. Session RPM limit (5) & Session RPD limit (30)
            if session_id:
                res = check_and_inc(f"sess:{session_id}:rpm", settings.COSMIC_AI_SESSION_RPM, current_minute, 60 - (now_sec % 60))
                if res:
                    return res
                res = check_and_inc(f"sess:{session_id}:rpd", settings.COSMIC_AI_SESSION_RPD, int(today.replace("-", "")), 3600)
                if res:
                    return res

            # C. IP RPM limit (8) & IP RPD limit (60)
            if client_ip:
                res = check_and_inc(f"ip:{client_ip}:rpm", settings.COSMIC_AI_IP_RPM, current_minute, 60 - (now_sec % 60))
                if res:
                    return res
                res = check_and_inc(f"ip:{client_ip}:rpd", settings.COSMIC_AI_IP_RPD, int(today.replace("-", "")), 3600)
                if res:
                    return res

            conn.commit()

        return True, "ok", 0

    # =========================================================================
    # Atomic Token Budget Reservation & Reconciliation
    # =========================================================================

    def reserve_budget(self, estimated_input_tokens: int, max_output_tokens: int) -> Tuple[bool, str, Optional[int]]:
        """
        Atomically checks remaining daily tokens and active concurrency.
        Returns: (approved: bool, reason: str, reservation_id: Optional[int])
        """
        if not self.is_ai_enabled():
            return False, "AI assistant disabled by administrator.", None

        if self.is_circuit_open():
            return False, "AI provider is temporarily recovering. Please retry shortly.", None

        today = self._today_utc()
        tokens_needed = estimated_input_tokens + max_output_tokens

        with self._get_connection() as conn:
            conn.execute("BEGIN IMMEDIATE")

            row = conn.execute("SELECT * FROM daily_usage WHERE date_key = ?", (today,)).fetchone()
            if not row:
                conn.execute(
                    "INSERT INTO daily_usage (date_key, total_requests, input_tokens, output_tokens, active_reservations, active_tokens_reserved) "
                    "VALUES (?, 0, 0, 0, 0, 0)",
                    (today,)
                )
                row = conn.execute("SELECT * FROM daily_usage WHERE date_key = ?", (today,)).fetchone()

            # Check Concurrency Limit (max 2 active)
            if row["active_reservations"] >= settings.COSMIC_AI_MAX_CONCURRENT:
                conn.rollback()
                return False, "System is busy handling other cosmic queries. Please wait a few seconds.", None

            # Check Global Daily Request Allowance (e.g. 300)
            if row["total_requests"] + row["active_reservations"] >= settings.COSMIC_AI_GLOBAL_RPD:
                conn.rollback()
                return False, "Daily AI request capacity reached. Deterministic scientific guide remains active.", None

            # Check Global Daily Token Allowance (e.g. 150,000)
            current_tokens = row["input_tokens"] + row["output_tokens"] + row["active_tokens_reserved"]
            if current_tokens + tokens_needed > settings.COSMIC_AI_DAILY_TOKEN_BUDGET:
                conn.rollback()
                return False, "Daily AI token quota reached. Deterministic scientific guide remains active.", None

            # Atomic increment of active reservation
            conn.execute(
                "UPDATE daily_usage SET active_reservations = active_reservations + 1, "
                "active_tokens_reserved = active_tokens_reserved + ?, "
                "last_updated = CURRENT_TIMESTAMP WHERE date_key = ?",
                (tokens_needed, today)
            )
            conn.commit()

        # Reservation succeeded: return timestamp-derived reservation token
        res_id = int(time.time() * 1000)
        return True, "ok", res_id

    def reconcile_usage(
        self,
        estimated_input_tokens: int,
        max_output_tokens: int,
        actual_input_tokens: Optional[int] = None,
        actual_output_tokens: Optional[int] = None,
        success: bool = True
    ):
        """
        Reconciles actual provider token consumption with reserved token allowance.
        """
        today = self._today_utc()
        reserved_tokens = estimated_input_tokens + max_output_tokens

        # Fallback to conservative estimated tokens if provider metrics unavailable
        final_in = actual_input_tokens if (actual_input_tokens is not None and actual_input_tokens > 0) else estimated_input_tokens
        final_out = actual_output_tokens if (actual_output_tokens is not None and actual_output_tokens >= 0) else (max_output_tokens // 2 if success else 0)

        with self._get_connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            conn.execute(
                "UPDATE daily_usage SET "
                "active_reservations = MAX(0, active_reservations - 1), "
                "active_tokens_reserved = MAX(0, active_tokens_reserved - ?), "
                "total_requests = total_requests + 1, "
                "input_tokens = input_tokens + ?, "
                "output_tokens = output_tokens + ?, "
                "last_updated = CURRENT_TIMESTAMP WHERE date_key = ?",
                (reserved_tokens, final_in, final_out, today)
            )
            conn.commit()

    def get_usage_metrics(self) -> Dict[str, Any]:
        """
        Returns real-time usage statistics for monitoring. Never exposes API keys.
        """
        today = self._today_utc()
        with self._get_connection() as conn:
            row = conn.execute("SELECT * FROM daily_usage WHERE date_key = ?", (today,)).fetchone()
            if not row:
                return {
                    "date": today,
                    "total_requests": 0,
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "total_tokens": 0,
                    "daily_token_budget": settings.COSMIC_AI_DAILY_TOKEN_BUDGET,
                    "daily_request_budget": settings.COSMIC_AI_GLOBAL_RPD,
                    "budget_percentage_used": 0.0,
                    "active_reservations": 0,
                    "circuit_open": self.is_circuit_open(),
                    "ai_enabled": self.is_ai_enabled(),
                }
            total = row["input_tokens"] + row["output_tokens"]
            pct = round((total / max(1, settings.COSMIC_AI_DAILY_TOKEN_BUDGET)) * 100, 2)
            return {
                "date": today,
                "total_requests": row["total_requests"],
                "input_tokens": row["input_tokens"],
                "output_tokens": row["output_tokens"],
                "total_tokens": total,
                "daily_token_budget": settings.COSMIC_AI_DAILY_TOKEN_BUDGET,
                "daily_request_budget": settings.COSMIC_AI_GLOBAL_RPD,
                "budget_percentage_used": pct,
                "active_reservations": row["active_reservations"],
                "circuit_open": self.is_circuit_open(),
                "ai_enabled": self.is_ai_enabled(),
            }

copilot_budget_service = CopilotBudgetService()

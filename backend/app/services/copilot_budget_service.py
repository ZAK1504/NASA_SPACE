import sqlite3
import time
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Tuple, Optional, Dict, Any, List
from app.config import settings

class CopilotBudgetService:
    """
    Production-grade, persistent SQLite-backed rate limiter, atomic token budgeter,
    and abuse prevention service for Cosmic Copilot Groq AI requests.
    Enforces daily AND monthly budgets, concurrency limits, and automatic stale-reservation recovery.
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
            # Daily persistent usage
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
            # Monthly persistent usage
            conn.execute("""
                CREATE TABLE IF NOT EXISTS monthly_usage (
                    month_key TEXT PRIMARY KEY,
                    total_requests INTEGER DEFAULT 0,
                    input_tokens INTEGER DEFAULT 0,
                    output_tokens INTEGER DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Active reservation tracking with unique reservation IDs (prevents double reconciliation & leaks)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS active_reservations (
                    reservation_id TEXT PRIMARY KEY,
                    date_key TEXT NOT NULL,
                    month_key TEXT NOT NULL,
                    tokens_reserved INTEGER NOT NULL,
                    created_at INTEGER NOT NULL,
                    reconciled INTEGER DEFAULT 0
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

            # CRITICAL RECOVERY: On backend startup/initialization, reset any in-flight active reservations
            # from previous server crashes so the system is never permanently deadlocked.
            conn.execute("UPDATE daily_usage SET active_reservations = 0, active_tokens_reserved = 0")
            conn.execute("UPDATE active_reservations SET reconciled = 2 WHERE reconciled = 0")
            conn.commit()

    @staticmethod
    def _today_utc() -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    @staticmethod
    def _this_month_utc() -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m")

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
    # Token Estimation Utility
    # =========================================================================

    @staticmethod
    def estimate_prompt_tokens(messages: List[Dict[str, Any]], reasoning_allowance: int = 350) -> int:
        """
        Conservative token estimator calculating system prompt, scientific context,
        conversation history, current user prompt, and reasoning model allowance.
        """
        total_chars = sum(len(str(m.get("content", ""))) for m in messages)
        # Average English/code text is ~3.5-4 characters per token; using 3.5 for safety margin
        estimated = int(total_chars / 3.5) + reasoning_allowance + 60
        return max(150, estimated)

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

            # A. Global RPM limit
            res = check_and_inc("global:rpm", settings.COSMIC_AI_GLOBAL_RPM, current_minute, 60 - (now_sec % 60))
            if res:
                return res

            # B. Session RPM limit & Session RPD limit
            if session_id:
                res = check_and_inc(f"sess:{session_id}:rpm", settings.COSMIC_AI_SESSION_RPM, current_minute, 60 - (now_sec % 60))
                if res:
                    return res
                res = check_and_inc(f"sess:{session_id}:rpd", settings.COSMIC_AI_SESSION_RPD, int(today.replace("-", "")), 3600)
                if res:
                    return res

            # C. IP RPM limit & IP RPD limit
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

    def _cleanup_stale_reservations_locked(self, conn: sqlite3.Connection, now_sec: int, today: str):
        """
        Reclaims any reservation older than 300 seconds that was not reconciled.
        Prevents concurrency leaks from sudden worker death or client drops.
        """
        stale_threshold = now_sec - 300
        stale_rows = conn.execute(
            "SELECT reservation_id, tokens_reserved FROM active_reservations "
            "WHERE reconciled = 0 AND created_at < ?",
            (stale_threshold,)
        ).fetchall()

        if stale_rows:
            reclaimed_tokens = sum(r["tokens_reserved"] for r in stale_rows)
            reclaimed_count = len(stale_rows)
            conn.execute(
                "UPDATE daily_usage SET "
                "active_reservations = MAX(0, active_reservations - ?), "
                "active_tokens_reserved = MAX(0, active_tokens_reserved - ?) "
                "WHERE date_key = ?",
                (reclaimed_count, reclaimed_tokens, today)
            )
            for r in stale_rows:
                conn.execute(
                    "UPDATE active_reservations SET reconciled = 2 WHERE reservation_id = ?",
                    (r["reservation_id"],)
                )

    def reserve_budget(self, estimated_input_tokens: int, max_output_tokens: int) -> Tuple[bool, str, Optional[str]]:
        """
        Atomically checks remaining daily tokens, monthly tokens, and active concurrency.
        Returns: (approved: bool, reason: str, reservation_id: Optional[str])
        """
        if not self.is_ai_enabled():
            return False, "AI assistant disabled by administrator.", None

        if self.is_circuit_open():
            return False, "AI provider is temporarily recovering. Please retry shortly.", None

        today = self._today_utc()
        this_month = self._this_month_utc()
        tokens_needed = estimated_input_tokens + max_output_tokens
        now_sec = int(time.time())

        with self._get_connection() as conn:
            conn.execute("BEGIN IMMEDIATE")

            # 1. Clear any stale reservations (> 5 mins old)
            self._cleanup_stale_reservations_locked(conn, now_sec, today)

            # 2. Check Daily Usage
            day_row = conn.execute("SELECT * FROM daily_usage WHERE date_key = ?", (today,)).fetchone()
            if not day_row:
                conn.execute(
                    "INSERT INTO daily_usage (date_key, total_requests, input_tokens, output_tokens, active_reservations, active_tokens_reserved) "
                    "VALUES (?, 0, 0, 0, 0, 0)",
                    (today,)
                )
                day_row = conn.execute("SELECT * FROM daily_usage WHERE date_key = ?", (today,)).fetchone()

            # 3. Check Monthly Usage
            month_row = conn.execute("SELECT * FROM monthly_usage WHERE month_key = ?", (this_month,)).fetchone()
            if not month_row:
                conn.execute(
                    "INSERT INTO monthly_usage (month_key, total_requests, input_tokens, output_tokens) "
                    "VALUES (?, 0, 0, 0)",
                    (this_month,)
                )
                month_row = conn.execute("SELECT * FROM monthly_usage WHERE month_key = ?", (this_month,)).fetchone()

            # A. Check Concurrency Limit
            if day_row["active_reservations"] >= settings.COSMIC_AI_MAX_CONCURRENT:
                conn.rollback()
                return False, "System is busy handling other cosmic queries. Please wait a few seconds.", None

            # B. Check Global Daily Request Allowance
            if day_row["total_requests"] + day_row["active_reservations"] >= settings.COSMIC_AI_GLOBAL_RPD:
                conn.rollback()
                return False, "Daily AI request capacity reached. Deterministic scientific guide remains active.", None

            # C. Check Global Monthly Request Allowance
            if month_row["total_requests"] >= settings.COSMIC_AI_MONTHLY_RPD:
                conn.rollback()
                return False, "Monthly AI request capacity reached. Deterministic scientific guide remains active.", None

            # D. Check Global Daily Token Allowance
            current_daily_tokens = day_row["input_tokens"] + day_row["output_tokens"] + day_row["active_tokens_reserved"]
            if current_daily_tokens + tokens_needed > settings.COSMIC_AI_DAILY_TOKEN_BUDGET:
                conn.rollback()
                return False, "Daily AI token quota reached. Deterministic scientific guide remains active.", None

            # E. Check Global Monthly Token Allowance
            current_monthly_tokens = month_row["input_tokens"] + month_row["output_tokens"] + day_row["active_tokens_reserved"]
            if current_monthly_tokens + tokens_needed > settings.COSMIC_AI_MONTHLY_TOKEN_BUDGET:
                conn.rollback()
                return False, "Monthly AI token quota reached. Deterministic scientific guide remains active.", None

            # Unique Reservation ID
            reservation_id = f"res_{now_sec}_{secrets.token_hex(4)}"

            # Record active reservation
            conn.execute(
                "INSERT INTO active_reservations (reservation_id, date_key, month_key, tokens_reserved, created_at, reconciled) "
                "VALUES (?, ?, ?, ?, ?, 0)",
                (reservation_id, today, this_month, tokens_needed, now_sec)
            )

            # Atomic increment of daily active reservation
            conn.execute(
                "UPDATE daily_usage SET active_reservations = active_reservations + 1, "
                "active_tokens_reserved = active_tokens_reserved + ?, "
                "last_updated = CURRENT_TIMESTAMP WHERE date_key = ?",
                (tokens_needed, today)
            )
            conn.commit()

        return True, "ok", reservation_id

    def reconcile_usage(
        self,
        reservation_id: Optional[str],
        estimated_input_tokens: int,
        max_output_tokens: int,
        actual_input_tokens: Optional[int] = None,
        actual_output_tokens: Optional[int] = None,
        success: bool = True
    ):
        """
        Reconciles actual provider token consumption with reserved token allowance.
        Guarantees that each reservation is reconciled exactly once (idempotent).
        """
        if not reservation_id:
            return

        today = self._today_utc()
        this_month = self._this_month_utc()
        reserved_tokens = estimated_input_tokens + max_output_tokens

        # Fallback to conservative estimated tokens if provider metrics unavailable
        final_in = actual_input_tokens if (actual_input_tokens is not None and actual_input_tokens > 0) else estimated_input_tokens
        final_out = actual_output_tokens if (actual_output_tokens is not None and actual_output_tokens >= 0) else (max_output_tokens // 2 if success else 0)

        with self._get_connection() as conn:
            conn.execute("BEGIN IMMEDIATE")

            # Check if this reservation is still active and unreconciled
            res_row = conn.execute(
                "SELECT * FROM active_reservations WHERE reservation_id = ?",
                (reservation_id,)
            ).fetchone()

            if not res_row or res_row["reconciled"] != 0:
                # Already reconciled or expired; avoid double reconciliation
                conn.rollback()
                return

            # Mark as reconciled
            conn.execute(
                "UPDATE active_reservations SET reconciled = 1 WHERE reservation_id = ?",
                (reservation_id,)
            )

            # Update daily usage
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

            # Update monthly usage
            conn.execute(
                "INSERT INTO monthly_usage (month_key, total_requests, input_tokens, output_tokens, last_updated) "
                "VALUES (?, 1, ?, ?, CURRENT_TIMESTAMP) "
                "ON CONFLICT(month_key) DO UPDATE SET "
                "total_requests = total_requests + 1, "
                "input_tokens = input_tokens + excluded.input_tokens, "
                "output_tokens = output_tokens + excluded.output_tokens, "
                "last_updated = CURRENT_TIMESTAMP",
                (this_month, final_in, final_out)
            )

            conn.commit()

    def get_usage_metrics(self) -> Dict[str, Any]:
        """
        Returns real-time daily and monthly usage statistics for monitoring.
        Never exposes API keys or sensitive secrets.
        """
        today = self._today_utc()
        this_month = self._this_month_utc()
        with self._get_connection() as conn:
            day_row = conn.execute("SELECT * FROM daily_usage WHERE date_key = ?", (today,)).fetchone()
            month_row = conn.execute("SELECT * FROM monthly_usage WHERE month_key = ?", (this_month,)).fetchone()

            total_daily = (day_row["input_tokens"] + day_row["output_tokens"]) if day_row else 0
            daily_pct = round((total_daily / max(1, settings.COSMIC_AI_DAILY_TOKEN_BUDGET)) * 100, 2)

            total_monthly = (month_row["input_tokens"] + month_row["output_tokens"]) if month_row else 0
            monthly_pct = round((total_monthly / max(1, settings.COSMIC_AI_MONTHLY_TOKEN_BUDGET)) * 100, 2)

            return {
                "date": today,
                "month": this_month,
                "total_requests": day_row["total_requests"] if day_row else 0,
                "input_tokens": day_row["input_tokens"] if day_row else 0,
                "output_tokens": day_row["output_tokens"] if day_row else 0,
                "total_tokens": total_daily,
                "daily_token_budget": settings.COSMIC_AI_DAILY_TOKEN_BUDGET,
                "daily_request_budget": settings.COSMIC_AI_GLOBAL_RPD,
                "budget_percentage_used": daily_pct,
                "monthly_requests": month_row["total_requests"] if month_row else 0,
                "monthly_tokens": total_monthly,
                "monthly_token_budget": settings.COSMIC_AI_MONTHLY_TOKEN_BUDGET,
                "monthly_request_budget": settings.COSMIC_AI_MONTHLY_RPD,
                "monthly_budget_percentage_used": monthly_pct,
                "active_reservations": day_row["active_reservations"] if day_row else 0,
                "circuit_open": self.is_circuit_open(),
                "ai_enabled": self.is_ai_enabled(),
            }

copilot_budget_service = CopilotBudgetService()

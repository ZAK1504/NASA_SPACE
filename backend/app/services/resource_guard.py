import threading
from collections import OrderedDict
from contextlib import contextmanager
from typing import Any, Optional, Dict
from fastapi import HTTPException
from app.config import settings

class LRUCache:
    """Thread-safe bounded in-memory LRU cache."""
    def __init__(self, max_size: int = 50):
        self.max_size = max_size
        self._cache: OrderedDict[str, Any] = OrderedDict()
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key not in self._cache:
                return None
            self._cache.move_to_end(key)
            return self._cache[key]

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = value
            while len(self._cache) > self.max_size:
                self._cache.popitem(last=False)

    def __contains__(self, key: str) -> bool:
        with self._lock:
            return key in self._cache

    def __getitem__(self, key: str) -> Any:
        val = self.get(key)
        if val is None:
            raise KeyError(key)
        return val

    def __setitem__(self, key: str, value: Any) -> None:
        self.set(key, value)


class ResourceGuard:
    """
    Admission controller for CPU- and memory-intensive scientific operations
    (e.g., WCS reprojection, DAOStarFinder detection, and FITS co-addition).
    Prevents VM overload and thrashing on the 2 vCPU / 8 GB target host.
    """
    def __init__(self):
        self._semaphore = threading.Semaphore(settings.MAX_HEAVY_JOBS)
        self._pending_count = 0
        self._lock = threading.Lock()

    @contextmanager
    def heavy_job(self):
        with self._lock:
            if self._pending_count >= settings.MAX_PENDING_JOBS:
                raise HTTPException(
                    status_code=429,
                    detail="Server is currently executing maximum concurrent scientific computations. Please retry in a few moments."
                )
            self._pending_count += 1

        acquired = False
        try:
            # Wait up to 25 seconds for an execution slot
            acquired = self._semaphore.acquire(timeout=25.0)
            if not acquired:
                raise HTTPException(
                    status_code=503,
                    detail="Scientific processing queue timed out. Please reduce field of view or retry shortly."
                )
            yield
        finally:
            if acquired:
                self._semaphore.release()
            with self._lock:
                self._pending_count = max(0, self._pending_count - 1)

resource_guard = ResourceGuard()

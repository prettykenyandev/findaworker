"""
Task Queue — MongoDB-backed, replaces the old JSON file persistence.
"""
from typing import List, Optional, Any
from collections import deque
from datetime import datetime
import time

from .database import get_db


class TaskQueue:
    def __init__(self):
        self._completed_timestamps: deque = deque(maxlen=1000)

    # ── public API ────────────────────────────────────────────────────────
    async def enqueue(self, task: dict) -> None:
        db = get_db()
        await db.tasks.insert_one(task)

    async def get(self, task_id: str) -> Optional[dict]:
        db = get_db()
        doc = await db.tasks.find_one({"id": task_id}, {"_id": 0})
        return doc

    async def update_status(
        self, task_id: str, status: str,
        result: Any = None, error: str = None
    ) -> None:
        db = get_db()
        update: dict = {"$set": {"status": status}}

        if status == "running":
            update["$set"]["started_at"] = datetime.utcnow().isoformat()
        if status in ("completed", "failed"):
            update["$set"]["finished_at"] = datetime.utcnow().isoformat()
            if status == "completed":
                self._completed_timestamps.append(time.time())
        if result is not None:
            update["$set"]["result"] = result
        if error is not None:
            update["$set"]["error"] = error

        await db.tasks.update_one({"id": task_id}, update)

    async def list_tasks(
        self, agent_id: Optional[str] = None, limit: int = 50
    ) -> List[dict]:
        db = get_db()
        query: dict = {}
        if agent_id:
            query["agent_id"] = agent_id

        cursor = db.tasks.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    def get_throughput(self) -> dict:
        now = time.time()
        last_60s = sum(1 for ts in self._completed_timestamps if now - ts < 60)
        last_300s = sum(1 for ts in self._completed_timestamps if now - ts < 300)
        return {"per_minute": last_60s, "per_5_minutes": last_300s}

"""
Task Queue - priority task queue with JSON file persistence
Survives server restarts (uvicorn --reload)
"""
from typing import Dict, List, Optional, Any
from collections import deque
from datetime import datetime
import time
import json
import os

PERSIST_PATH = os.path.join(os.path.dirname(__file__), "..", "_data_tasks.json")


class TaskQueue:
    def __init__(self):
        self._tasks: Dict[str, dict] = {}
        self._completed_timestamps: deque = deque(maxlen=1000)
        self._load()

    # ── persistence ───────────────────────────────────────────────────────
    def _load(self):
        try:
            if os.path.exists(PERSIST_PATH):
                with open(PERSIST_PATH, "r") as f:
                    data = json.load(f)
                self._tasks = {t["id"]: t for t in data}
        except Exception:
            self._tasks = {}

    def _save(self):
        try:
            os.makedirs(os.path.dirname(PERSIST_PATH), exist_ok=True)
            with open(PERSIST_PATH, "w") as f:
                json.dump(list(self._tasks.values()), f)
        except Exception:
            pass

    # ── public API ────────────────────────────────────────────────────────
    def enqueue(self, task: dict) -> None:
        self._tasks[task["id"]] = task
        self._save()

    def get(self, task_id: str) -> Optional[dict]:
        return self._tasks.get(task_id)

    def update_status(self, task_id: str, status: str, result: Any = None, error: str = None) -> None:
        if task_id not in self._tasks:
            return
        self._tasks[task_id]["status"] = status
        if status == "running":
            self._tasks[task_id]["started_at"] = datetime.utcnow().isoformat()
        if status in ("completed", "failed"):
            self._tasks[task_id]["finished_at"] = datetime.utcnow().isoformat()
            if status == "completed":
                self._completed_timestamps.append(time.time())
        if result is not None:
            self._tasks[task_id]["result"] = result
        if error is not None:
            self._tasks[task_id]["error"] = error
        self._save()

    def list_tasks(self, agent_id: Optional[str] = None, limit: int = 50) -> List[dict]:
        tasks = list(self._tasks.values())
        if agent_id:
            tasks = [t for t in tasks if t["agent_id"] == agent_id]
        tasks.sort(key=lambda t: t.get("created_at", ""), reverse=True)
        return tasks[:limit]

    def get_throughput(self) -> dict:
        """Tasks completed in last 60 seconds"""
        now = time.time()
        last_60s = sum(1 for ts in self._completed_timestamps if now - ts < 60)
        last_300s = sum(1 for ts in self._completed_timestamps if now - ts < 300)
        return {
            "per_minute": last_60s,
            "per_5_minutes": last_300s
        }

"""
Base Agent - all digital workers extend this class
"""
import time
from datetime import datetime
from typing import Dict, Any, Optional


class BaseAgent:
    def __init__(self, agent_id: str, name: str, agent_type: str,
                 config: Dict[str, Any] = None, description: str = ""):
        self.agent_id = agent_id
        self.name = name
        self.agent_type = agent_type
        self.config = config or {}
        self.description = description
        self.status = "running"
        self.created_at = datetime.utcnow().isoformat()
        self._start_time = time.time()
        self.tasks_completed = 0
        self.tasks_failed = 0
        self.current_task: Optional[str] = None

    def get_status(self) -> dict:
        return {
            "id": self.agent_id,
            "name": self.name,
            "type": self.agent_type,
            "description": self.description,
            "status": self.status,
            "config": self.config,
            "created_at": self.created_at,
            "uptime_seconds": round(time.time() - self._start_time, 1),
            "tasks_completed": self.tasks_completed,
            "tasks_failed": self.tasks_failed,
            "current_task": self.current_task,
        }

    def increment_completed(self):
        self.tasks_completed += 1
        self.current_task = None

    def increment_failed(self):
        self.tasks_failed += 1
        self.current_task = None

    async def execute(self, task_type: str, payload: Dict[str, Any]) -> Any:
        raise NotImplementedError("Subclasses must implement execute()")

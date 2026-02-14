"""
Agent Orchestrator — MongoDB-backed, persists agents across restarts.
Agents are still instantiated in-memory for task execution, but their
metadata is stored in MongoDB so the list survives restarts.
"""
from typing import Dict, Optional, List
from datetime import datetime
import time

from .database import get_db


class AgentOrchestrator:
    def __init__(self):
        # Live agent instances (needed for execute())
        self._agents: Dict[str, object] = {}

    async def register(self, agent) -> None:
        """Register a live agent instance and persist its metadata."""
        self._agents[agent.agent_id] = agent
        db = get_db()
        await db.agents.update_one(
            {"agent_id": agent.agent_id},
            {"$set": {
                "agent_id": agent.agent_id,
                "name": agent.name,
                "type": agent.agent_type,
                "description": agent.description,
                "status": agent.status,
                "config": agent.config,
                "created_at": agent.created_at,
                "tasks_completed": agent.tasks_completed,
                "tasks_failed": agent.tasks_failed,
            }},
            upsert=True,
        )

    def get(self, agent_id: str) -> Optional[object]:
        return self._agents.get(agent_id)

    async def terminate(self, agent_id: str) -> bool:
        if agent_id not in self._agents:
            return False
        agent = self._agents[agent_id]
        agent.status = "terminated"
        del self._agents[agent_id]
        db = get_db()
        await db.agents.update_one(
            {"agent_id": agent_id},
            {"$set": {"status": "terminated"}},
        )
        return True

    async def list_agents(self) -> List[dict]:
        """Return statuses of live agents (with live uptime), plus
        terminated agents from DB so history is visible."""
        live = [a.get_status() for a in self._agents.values()]
        live_ids = {a["id"] for a in live}

        # Also include recently terminated agents from DB
        db = get_db()
        cursor = db.agents.find(
            {"agent_id": {"$nin": list(live_ids)}},
            {"_id": 0},
        ).sort("created_at", -1).limit(50)
        historical = await cursor.to_list(length=50)

        # Normalize historical docs to match live schema
        for doc in historical:
            doc.setdefault("id", doc.pop("agent_id", ""))
            doc.setdefault("uptime_seconds", 0)
            doc.setdefault("current_task", None)

        return live + historical

    async def sync_counters(self, agent_id: str, completed: int, failed: int):
        """Persist updated task counters after each task finishes."""
        db = get_db()
        await db.agents.update_one(
            {"agent_id": agent_id},
            {"$set": {"tasks_completed": completed, "tasks_failed": failed}},
        )

    def get_running_count(self) -> int:
        return sum(1 for a in self._agents.values() if a.status == "running")

"""
Agent Orchestrator - manages lifecycle of all deployed agents
"""
from typing import Dict, Optional, List
from datetime import datetime
import time


class AgentOrchestrator:
    def __init__(self):
        self._agents: Dict[str, object] = {}

    def register(self, agent) -> None:
        self._agents[agent.agent_id] = agent

    def get(self, agent_id: str) -> Optional[object]:
        return self._agents.get(agent_id)

    def terminate(self, agent_id: str) -> bool:
        if agent_id not in self._agents:
            return False
        agent = self._agents[agent_id]
        agent.status = "terminated"
        del self._agents[agent_id]
        return True

    def list_agents(self) -> List[dict]:
        return [a.get_status() for a in self._agents.values()]

    def get_running_count(self) -> int:
        return sum(1 for a in self._agents.values() if a.status == "running")

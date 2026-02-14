"""
AI Workforce Platform - Python Agent Backend
Handles agent orchestration, task execution, and AI model integration
"""
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import json
import uuid
import time
from datetime import datetime
from agents.customer_support import CustomerSupportAgent
from agents.data_entry import DataEntryAgent
from agents.software_engineer import SoftwareEngineerAgent
from core.orchestrator import AgentOrchestrator
from core.task_queue import TaskQueue

app = FastAPI(title="AI Workforce Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (replace with Redis/DB in production)
orchestrator = AgentOrchestrator()
task_queue = TaskQueue()
active_connections: Dict[str, WebSocket] = {}

# ─── Models ──────────────────────────────────────────────────────────────────

class DeployAgentRequest(BaseModel):
    agent_type: str  # "customer_support" | "data_entry" | "software_engineer"
    name: str
    config: Dict[str, Any] = {}
    description: Optional[str] = None

class SubmitTaskRequest(BaseModel):
    agent_id: str
    task_type: str
    payload: Dict[str, Any]
    priority: int = 5  # 1-10

class AgentResponse(BaseModel):
    id: str
    name: str
    type: str
    status: str
    config: Dict[str, Any]
    created_at: str
    tasks_completed: int
    tasks_failed: int
    uptime_seconds: float

# ─── Agent Registry ──────────────────────────────────────────────────────────

ALLOWED_AGENT_TYPES = {"software_engineer"}

AGENT_CLASSES = {
    "customer_support": CustomerSupportAgent,
    "data_entry": DataEntryAgent,
    "software_engineer": SoftwareEngineerAgent,
}

# ─── REST Endpoints ──────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/agents")
async def list_agents():
    return orchestrator.list_agents()

@app.post("/agents/deploy")
async def deploy_agent(req: DeployAgentRequest, background_tasks: BackgroundTasks):
    if req.agent_type not in AGENT_CLASSES:
        raise HTTPException(400, f"Unknown agent type: {req.agent_type}")
    if req.agent_type not in ALLOWED_AGENT_TYPES:
        raise HTTPException(403, f"Agent type '{req.agent_type}' is not enabled")
    
    agent_id = str(uuid.uuid4())[:8]
    AgentClass = AGENT_CLASSES[req.agent_type]
    agent = AgentClass(
        agent_id=agent_id,
        name=req.name,
        config=req.config,
        description=req.description or f"{req.agent_type} agent"
    )
    orchestrator.register(agent)
    background_tasks.add_task(broadcast_agent_update, agent_id)
    
    return {
        "id": agent_id,
        "name": req.name,
        "type": req.agent_type,
        "status": "running",
        "created_at": datetime.utcnow().isoformat()
    }

@app.delete("/agents/{agent_id}")
async def terminate_agent(agent_id: str):
    success = orchestrator.terminate(agent_id)
    if not success:
        raise HTTPException(404, "Agent not found")
    return {"status": "terminated", "agent_id": agent_id}

@app.get("/agents/{agent_id}/status")
async def agent_status(agent_id: str):
    agent = orchestrator.get(agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return agent.get_status()

@app.post("/tasks/submit")
async def submit_task(req: SubmitTaskRequest, background_tasks: BackgroundTasks):
    agent = orchestrator.get(req.agent_id)
    if not agent:
        raise HTTPException(404, f"Agent {req.agent_id} not found")
    
    task_id = str(uuid.uuid4())[:8]
    task = {
        "id": task_id,
        "agent_id": req.agent_id,
        "type": req.task_type,
        "payload": req.payload,
        "priority": req.priority,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat(),
        "result": None,
        "error": None
    }
    task_queue.enqueue(task)
    background_tasks.add_task(process_task, task_id, agent, task)
    
    return {"task_id": task_id, "status": "queued"}

@app.get("/tasks/{task_id}")
async def get_task(task_id: str):
    task = task_queue.get(task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    return task

@app.get("/tasks")
async def list_tasks(agent_id: Optional[str] = None, limit: int = 50):
    return task_queue.list_tasks(agent_id=agent_id, limit=limit)

@app.get("/metrics")
async def platform_metrics():
    agents = orchestrator.list_agents()
    tasks = task_queue.list_tasks(limit=1000)
    
    total_tasks = len(tasks)
    completed = sum(1 for t in tasks if t["status"] == "completed")
    failed = sum(1 for t in tasks if t["status"] == "failed")
    running = sum(1 for t in tasks if t["status"] == "running")
    
    return {
        "agents": {
            "total": len(agents),
            "running": sum(1 for a in agents if a["status"] == "running"),
            "idle": sum(1 for a in agents if a["status"] == "idle"),
        },
        "tasks": {
            "total": total_tasks,
            "completed": completed,
            "failed": failed,
            "running": running,
            "success_rate": round(completed / max(total_tasks, 1) * 100, 1)
        },
        "throughput": task_queue.get_throughput()
    }

# ─── WebSocket ────────────────────────────────────────────────────────────────

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    active_connections[client_id] = websocket
    try:
        # Send initial state
        await websocket.send_json({
            "type": "init",
            "agents": orchestrator.list_agents(),
            "tasks": task_queue.list_tasks(limit=20),
            "metrics": (await platform_metrics())
        })
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        del active_connections[client_id]

async def broadcast(message: dict):
    dead = []
    for cid, ws in active_connections.items():
        try:
            await ws.send_json(message)
        except:
            dead.append(cid)
    for cid in dead:
        del active_connections[cid]

async def broadcast_agent_update(agent_id: str):
    await asyncio.sleep(0.1)
    agents = orchestrator.list_agents()
    await broadcast({"type": "agents_update", "agents": agents})

async def process_task(task_id: str, agent, task: dict):
    await asyncio.sleep(0.05)
    task_queue.update_status(task_id, "running")
    await broadcast({"type": "task_update", "task": task_queue.get(task_id)})
    
    try:
        result = await agent.execute(task["type"], task["payload"])
        task_queue.update_status(task_id, "completed", result=result)
        agent.increment_completed()
    except Exception as e:
        task_queue.update_status(task_id, "failed", error=str(e))
        agent.increment_failed()
    
    final_task = task_queue.get(task_id)
    await broadcast({"type": "task_update", "task": final_task})
    await broadcast({"type": "metrics_update", "metrics": (await platform_metrics())})
    await broadcast_agent_update(agent.agent_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

"""
MongoDB connection — async via motor
Uses MONGODB_URI from environment, falls back to localhost.
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB", "workforce")

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGODB_URI)
    return _client


def get_db():
    return get_client()[DB_NAME]


async def ensure_indexes():
    """Create indexes on first startup."""
    db = get_db()
    await db.tasks.create_index("agent_id")
    await db.tasks.create_index("status")
    await db.tasks.create_index([("created_at", -1)])
    await db.agents.create_index("agent_id", unique=True)


async def ping() -> bool:
    try:
        await get_client().admin.command("ping")
        return True
    except Exception:
        return False

# Workforce.AI — AI Worker Platform

Hire AI workers to perform real software engineering tasks powered by Claude.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│           React Frontend (Vite) — Port 5173                     │
│   Dashboard · Workers · Activity · Real-time polling            │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP / WS (proxied)
┌──────────────────────▼──────────────────────────────────────────┐
│                        API GATEWAY                               │
│           Node.js + Express — Port 3001                         │
│   Auth (JWT + MongoDB) · Rate Limiting · Helmet · Proxy         │
└──────────┬──────────────────────┬───────────────────────────────┘
           │ REST proxy            │ WS proxy
┌──────────▼──────────────────────▼───────────────────────────────┐
│                      AGENT BACKEND                               │
│           Python FastAPI + Uvicorn — Port 8001                  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Agent Orchestrator                      │  │
│  │               ┌──────────────────────┐                    │  │
│  │               │   Software Engineer  │                    │  │
│  │               │   Agent (Claude AI)  │                    │  │
│  │               └──────────────────────┘                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│              MongoDB Atlas (tasks, agents, users)                │
│                   WebSocket broadcast hub                        │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- MongoDB Atlas account (free M0 tier works)
- Anthropic API key (for Claude)

### 1. Configure Environment

**backend-python/.env**
```env
ANTHROPIC_API_KEY=your-anthropic-api-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0
```

**backend-node/.env**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/workforce?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
```

### 2. Start Python Agent Backend
```bash
cd backend-python
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Start Node.js API Gateway
```bash
cd backend-node
npm install
node src/index.js
```

### 4. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Open browser
Navigate to: **http://localhost:5173**

Use demo credentials or click **Instant Demo Access**.

---

## Software Engineer Agent (Claude-Powered)

The platform currently supports a single agent type — **Software Engineer** — powered by Claude (`claude-sonnet-4-20250514`). Tasks are described in natural language and the agent generates real code.

| Task | Description |
|------|-------------|
| `generate_code` | Generate a single file (endpoint, component, script, etc.) |
| `generate_project` | Generate a full multi-file project with file explorer & zip download |
| `review_pr` | Review pull requests with line-by-line comments |
| `write_tests` | Generate unit test suites |
| `detect_bugs` | Static analysis for bugs and security issues |
| `generate_docs` | Write docstrings, READMEs, and API docs |
| `refactor` | Suggest and apply code improvements |
| `generate_migration` | Generate database migration scripts |

**Smart prompt handling:** Simple prompts like "generate code" are auto-upgraded to `generate_project` when the description implies a full application. Vague prompts are enriched by the agent before sending to Claude.

---

## API Reference

### Authentication
```
POST /api/auth/login         # Email/password login
POST /api/auth/register      # Create new account
POST /api/auth/demo          # Instant demo access
POST /api/auth/refresh       # Refresh JWT token
```

### Agents
```
GET    /api/agents            # List all deployed agents
POST   /api/agents/deploy     # Deploy (hire) a new worker
DELETE /api/agents/:id        # Terminate a worker
GET    /api/agents/:id/status # Get agent status
```

### Tasks
```
POST /api/tasks/submit        # Submit a task to an agent
GET  /api/tasks               # List tasks (filter by agent_id)
GET  /api/tasks/:id           # Get task details & result
```

### Metrics
```
GET /api/metrics              # Platform-wide metrics
```

### WebSocket
```
WS /ws/:clientId              # Real-time updates
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Zustand, Recharts, date-fns, JSZip, Lucide icons |
| API Gateway | Node.js, Express, http-proxy-middleware, JWT, Mongoose |
| Agent Backend | Python, FastAPI, Uvicorn, Anthropic SDK, Motor (async MongoDB) |
| Database | MongoDB Atlas |
| AI Model | Claude (claude-sonnet-4-20250514) via Anthropic API |

## Key Features

- **Natural language task input** — describe what you need in plain text
- **Multi-file project generation** — full project scaffolding with file explorer UI
- **Zip download** — download generated projects as .zip files
- **Real-time updates** — lightweight polling updates task status without page refresh
- **Worker cards** — see active/recent tasks per worker with processing duration
- **Mobile responsive** — hamburger menu, sidebar drawer, responsive grids
- **Persistent storage** — all tasks, agents, and users stored in MongoDB Atlas

---

## License
MIT

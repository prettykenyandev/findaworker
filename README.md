# ⚡ Workforce.AI — AI Agent Platform

Deploy digital workers to perform real operational tasks reliably at scale.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│           React Frontend (Vite) — Port 5173                     │
│   Dashboard · Agents · Tasks · Real-time WebSocket updates      │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP / WS (proxied)
┌──────────────────────▼──────────────────────────────────────────┐
│                        API GATEWAY                               │
│           Node.js + Express — Port 3001                         │
│   Auth (JWT) · Rate Limiting · Helmet · Logging · Proxy         │
└──────────┬──────────────────────┬───────────────────────────────┘
           │ REST proxy            │ WS proxy
┌──────────▼──────────────────────▼───────────────────────────────┐
│                      AGENT BACKEND                               │
│           Python FastAPI + Uvicorn — Port 8001                  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Agent Orchestrator                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │  Customer   │  │    Data     │  │    Software      │  │  │
│  │  │  Support    │  │    Entry    │  │    Engineer      │  │  │
│  │  │   Agent     │  │    Agent    │  │     Agent        │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│                      Task Queue (in-memory)                      │
│                 WebSocket broadcast hub                          │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- npm / pip

### 1. Start Python Agent Backend
```bash
cd backend-python
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Start Node.js API Gateway
```bash
cd backend-node
npm install
npm run dev
```

### 3. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open browser
Navigate to: **http://localhost:5173**

Use demo credentials: **admin@demo.com / demo1234** or click **Instant Demo Access**

---

## Agent Types

### 🎧 Customer Support Agent
Handles the full customer support lifecycle:
| Task | Description |
|------|-------------|
| `triage_ticket` | Classify tickets by category, sentiment & priority |
| `draft_response` | Generate contextual reply drafts |
| `analyze_sentiment` | Score sentiment with urgency detection |
| `bulk_classify` | Classify up to 50 tickets at once |

### 🗄️ Data Entry Agent
Structured data operations at scale:
| Task | Description |
|------|-------------|
| `extract_fields` | Extract structured fields from unstructured text |
| `validate_records` | Validate records against a JSON schema |
| `transform_data` | Apply transformations (uppercase, lowercase, format) |
| `enrich_records` | Enrich records with external data sources |
| `deduplicate` | Remove duplicate records by key fields |
| `parse_document` | Parse invoices, contracts, and forms |

### 💻 Software Engineer Agent
AI-powered development assistance:
| Task | Description |
|------|-------------|
| `generate_code` | Generate REST endpoints, React components, SQL migrations |
| `review_pr` | Review pull requests with line-by-line comments |
| `write_tests` | Generate unit test suites with coverage targets |
| `detect_bugs` | Static analysis for bugs, security issues, and anti-patterns |
| `generate_docs` | Write docstrings, READMEs, and OpenAPI specs |
| `refactor` | Suggest and apply code improvements |

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
POST   /api/agents/deploy     # Deploy a new agent
DELETE /api/agents/:id        # Terminate an agent
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
GET /api/analytics/overview   # Analytics with trends
```

### WebSocket
```
WS /ws/:clientId              # Real-time updates
```

WebSocket message types:
- `init` — Full state snapshot on connect
- `agents_update` — Agent list changed
- `task_update` — Task status/result changed
- `metrics_update` — Platform metrics updated

---

## Environment Variables

### backend-node/.env
```env
PORT=3001
PYTHON_BACKEND_URL=http://localhost:8001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### backend-python/.env
```env
PORT=8001
```

---

## Production Deployment

For production, replace:
1. **Task Queue** → Redis + Celery or BullMQ
2. **In-memory stores** → PostgreSQL / MongoDB
3. **JWT secrets** → Rotate and store in secrets manager
4. **Agent execution** → Replace simulated `asyncio.sleep` with real LLM API calls (Anthropic Claude, OpenAI, etc.)

### Plugging in Real AI
In each agent's `execute()` method, replace the simulation with actual LLM calls:

```python
# In agents/customer_support.py
import anthropic

async def _triage_ticket(self, payload: dict) -> dict:
    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-opus-4-5-20251101",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Triage this support ticket: {payload['text']}\n\nClassify by: category, sentiment, priority."
        }]
    )
    # Parse structured response...
```

---

## License
MIT

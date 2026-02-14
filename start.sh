#!/bin/bash

# ⚡ Workforce.AI - Start all services
set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "  ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗███████╗ ██████╗ ██████╗  ██████╗███████╗"
echo "  ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝"
echo "  ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ █████╗  ██║   ██║██████╔╝██║     █████╗  "
echo "  ██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██╔══╝  ██║   ██║██╔══██╗██║     ██╔══╝  "
echo "  ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗██║     ╚██████╔╝██║  ██║╚██████╗███████╗"
echo "   ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚══════╝"
echo -e "${NC}"
echo -e "${YELLOW}  AI Workforce Platform — Launching all services...${NC}"
echo ""

# Check dependencies
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required."; exit 1; }

# Install dependencies if needed
echo -e "${CYAN}[1/3] Installing Python dependencies...${NC}"
cd backend-python && pip install -r requirements.txt -q && cd ..

echo -e "${CYAN}[2/3] Installing Node.js gateway dependencies...${NC}"
cd backend-node && npm install --silent && cd ..

echo -e "${CYAN}[3/3] Installing Frontend dependencies...${NC}"
cd frontend && npm install --silent && cd ..

echo ""
echo -e "${GREEN}✅ Dependencies ready. Starting services...${NC}"
echo ""

# Start Python backend
echo -e "${CYAN}Starting Python Agent Backend on :8001${NC}"
cd backend-python && uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
PYTHON_PID=$!
cd ..

sleep 2

# Start Node gateway
echo -e "${CYAN}Starting Node.js Gateway on :3001${NC}"
cd backend-node && node src/index.js &
NODE_PID=$!
cd ..

sleep 1

# Start Frontend
echo -e "${CYAN}Starting React Frontend on :5173${NC}"
cd frontend && npm run dev &
VITE_PID=$!
cd ..

sleep 2

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗"
echo -e "║  ⚡ Workforce.AI is LIVE                         ║"
echo -e "║                                                  ║"
echo -e "║  Frontend:    http://localhost:5173              ║"
echo -e "║  API Gateway: http://localhost:3001              ║"
echo -e "║  Agent API:   http://localhost:8001              ║"
echo -e "║  API Docs:    http://localhost:8001/docs         ║"
echo -e "║                                                  ║"
echo -e "║  Demo login: admin@demo.com / demo1234           ║"
echo -e "║  Or click: Instant Demo Access                   ║"
echo -e "╚══════════════════════════════════════════════════╝${NC}"

# Cleanup on exit
cleanup() {
  echo ""
  echo "Shutting down services..."
  kill $PYTHON_PID $NODE_PID $VITE_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

wait

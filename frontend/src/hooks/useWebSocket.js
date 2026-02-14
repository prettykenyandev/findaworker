import { useEffect, useRef, useCallback } from "react";
import { useStore } from "../store";

export function useWebSocket() {
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const pollTimer = useRef(null);
  const clientId = useRef(`client-${Math.random().toString(36).slice(2, 8)}`);

  const {
    updateAgentFromWs,
    updateTaskFromWs,
    updateMetricsFromWs,
    addNotification,
    pollTaskStatuses,
    token,
  } = useStore();

  const connect = useCallback(() => {
    if (!token) return;
    
    try {
      const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/${clientId.current}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("🔌 WebSocket connected");
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleMessage(msg);
        } catch (err) {
          console.error("WS parse error", err);
        }
      };

      ws.current.onclose = () => {
        console.log("🔌 WebSocket disconnected, reconnecting in 3s...");
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.current.onerror = (err) => {
        console.error("WS error", err);
      };
    } catch (err) {
      console.warn("WebSocket unavailable, running in polling mode");
    }
  }, [token]);

  const handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case "init":
        updateAgentFromWs(msg.agents || []);
        if (msg.tasks) msg.tasks.forEach(updateTaskFromWs);
        if (msg.metrics) updateMetricsFromWs(msg.metrics);
        break;

      case "agents_update":
        updateAgentFromWs(msg.agents || []);
        break;

      case "task_update":
        if (msg.task) {
          updateTaskFromWs(msg.task);
          if (msg.task.status === "completed") {
            addNotification({
              type: "success",
              message: `Task ${msg.task.id} completed`,
              agentId: msg.task.agent_id,
            });
          } else if (msg.task.status === "failed") {
            addNotification({
              type: "error",
              message: `Task ${msg.task.id} failed: ${msg.task.error || "Unknown error"}`,
            });
          }
        }
        break;

      case "metrics_update":
        if (msg.metrics) updateMetricsFromWs(msg.metrics);
        break;

      case "pong":
        break;

      default:
        console.log("Unknown WS message type:", msg.type);
    }
  }, []);

  // Heartbeat
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
    return () => clearInterval(pingInterval);
  }, []);

  // Lightweight poll — only patches task statuses, no full grid refresh
  useEffect(() => {
    if (!token) return;
    pollTimer.current = setInterval(pollTaskStatuses, 5000);
    return () => clearInterval(pollTimer.current);
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) ws.current.close();
    };
  }, [connect]);

  return { connected: ws.current?.readyState === WebSocket.OPEN };
}

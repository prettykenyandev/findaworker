import { create } from "zustand";
import api from "../lib/api";

export const useStore = create((set, get) => ({
  // ── Auth ────────────────────────────────────────────────────────────────────
  user: null,
  token: localStorage.getItem("wf_token") || null,

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, user } = res.data;
    localStorage.setItem("wf_token", accessToken);
    set({ token: accessToken, user });
    return user;
  },

  loginDemo: async () => {
    const res = await api.post("/auth/demo");
    const { accessToken, user } = res.data;
    localStorage.setItem("wf_token", accessToken);
    set({ token: accessToken, user });
    return user;
  },

  logout: () => {
    localStorage.removeItem("wf_token");
    set({ token: null, user: null, agents: [], tasks: [] });
  },

  // ── Agents ──────────────────────────────────────────────────────────────────
  agents: [],
  agentsLoading: false,

  fetchAgents: async () => {
    set({ agentsLoading: true });
    try {
      const res = await api.get("/agents");
      set({ agents: res.data });
    } catch (err) {
      console.error("Failed to fetch agents", err);
    } finally {
      set({ agentsLoading: false });
    }
  },

  deployAgent: async (payload) => {
    const res = await api.post("/agents/deploy", payload);
    await get().fetchAgents();
    return res.data;
  },

  terminateAgent: async (agentId) => {
    await api.delete(`/agents/${agentId}`);
    set((s) => ({ agents: s.agents.filter((a) => a.id !== agentId) }));
  },

  updateAgentFromWs: (agents) => set({ agents }),

  // ── Tasks ───────────────────────────────────────────────────────────────────
  tasks: [],
  tasksLoading: false,

  fetchTasks: async (agentId = null) => {
    set({ tasksLoading: true });
    try {
      const params = agentId ? `?agent_id=${agentId}` : "";
      const res = await api.get(`/tasks${params}`);
      set({ tasks: res.data });
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      set({ tasksLoading: false });
    }
  },

  submitTask: async (payload) => {
    const res = await api.post("/tasks/submit", payload);
    return res.data;
  },

  updateTaskFromWs: (task) => {
    set((s) => {
      const idx = s.tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const updated = [...s.tasks];
        updated[idx] = task;
        return { tasks: updated };
      }
      return { tasks: [task, ...s.tasks].slice(0, 100) };
    });
  },

  // Lightweight poll — only patches tasks whose status/result actually changed
  pollTaskStatuses: async () => {
    try {
      const res = await api.get("/tasks");
      const fresh = res.data;
      set((s) => {
        let changed = false;
        const merged = s.tasks.map((t) => {
          const f = fresh.find((ft) => ft.id === t.id);
          if (f && (f.status !== t.status || f.result !== t.result || f.error !== t.error)) {
            changed = true;
            return f;
          }
          return t;
        });
        // Add any new tasks not yet in store
        const existingIds = new Set(s.tasks.map((t) => t.id));
        const newTasks = fresh.filter((ft) => !existingIds.has(ft.id));
        if (newTasks.length > 0) changed = true;
        return changed ? { tasks: [...newTasks, ...merged].slice(0, 100) } : {};
      });
    } catch {}
  },

  // ── Metrics ─────────────────────────────────────────────────────────────────
  metrics: null,

  fetchMetrics: async () => {
    try {
      const res = await api.get("/metrics");
      set({ metrics: res.data });
    } catch {}
  },

  updateMetricsFromWs: (metrics) => set({ metrics }),

  // ── Notifications ────────────────────────────────────────────────────────────
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now();
    set((s) => ({
      notifications: [{ id, ...notification }, ...s.notifications].slice(0, 10),
    }));
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    }, 5000);
  },

  dismissNotification: (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
  },

  // ── UI ───────────────────────────────────────────────────────────────────────
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),

  deployModalOpen: false,
  setDeployModalOpen: (v) => set({ deployModalOpen: v }),
}));

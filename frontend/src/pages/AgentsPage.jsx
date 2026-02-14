import { useState } from "react";
import { useStore } from "../store";
import { AgentCard } from "../components/AgentCard";
import { TaskSubmitModal } from "../components/TaskSubmitModal";
import { Users, Plus, Search } from "lucide-react";

export function AgentsPage() {
  const { agents, agentsLoading, setDeployModalOpen } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [submitModal, setSubmitModal] = useState(null);

  const filtered = agents.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                        a.type.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || a.status === filter || a.type === filter;
    return matchSearch && matchFilter;
  });

  const FILTER_OPTIONS = [
    { value: "all", label: "All Workers" },
    { value: "running", label: "Active" },
    { value: "customer_support", label: "Support" },
    { value: "data_entry", label: "Data Entry" },
    { value: "software_engineer", label: "Engineering" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Workers</h1>
          <p style={styles.subtitle}>You have {agents.length} AI workers on your team</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDeployModalOpen(true)}>
          <Plus size={16} />
          Hire a Worker
        </button>
      </div>

      {/* Filter bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="input"
            style={{ paddingLeft: "34px" }}
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.filterTabs}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              style={{
                ...styles.filterTab,
                ...(filter === opt.value ? styles.filterTabActive : {}),
              }}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {agentsLoading ? (
        <div style={styles.loadingGrid}>
          {[1,2,3].map(i => <div key={i} style={styles.skeleton} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <Users size={48} style={{ opacity: 0.15, marginBottom: "16px" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", fontWeight: 600 }}>No workers found</p>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>Hire your first AI worker to get started</p>
          <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={() => setDeployModalOpen(true)}>
            <Plus size={16} /> Hire First Worker
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSubmitTask={() => setSubmitModal(agent)}
            />
          ))}
        </div>
      )}

      {submitModal && (
        <TaskSubmitModal agent={submitModal} onClose={() => setSubmitModal(null)} />
      )}
    </div>
  );
}

const styles = {
  page: { padding: "32px", display: "flex", flexDirection: "column", gap: "24px" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" },
  subtitle: { color: "var(--text-muted)", fontSize: "15px", marginTop: "4px" },
  filterBar: { display: "flex", gap: "12px", alignItems: "center" },
  searchWrapper: { position: "relative", width: "280px" },
  filterTabs: { display: "flex", gap: "6px" },
  filterTab: {
    padding: "8px 16px",
    background: "#ffffff",
    border: "1px solid var(--border)",
    borderRadius: "20px",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  filterTabActive: {
    background: "var(--accent-glow)",
    color: "var(--accent)",
    borderColor: "var(--accent)",
    fontWeight: 600,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" },
  loadingGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" },
  skeleton: { height: "220px", background: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", animation: "shimmer 1.5s ease infinite" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px", textAlign: "center" },
};

import { useEffect, useState } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store";
import { useWebSocket } from "../hooks/useWebSocket";
import { Dashboard } from "./Dashboard";
import { AgentsPage } from "./AgentsPage";
import { TasksPage } from "./TasksPage";
import { DeployModal } from "../components/DeployModal";
import { NotificationStack } from "../components/NotificationStack";
import {
  LayoutDashboard, Users, ListChecks, BarChart3,
  Zap, LogOut, Plus, Menu, X
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/agents", icon: Users, label: "My Workers" },
  { path: "/tasks", icon: ListChecks, label: "Activity" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
];

export function DashboardLayout() {
  const { user, logout, fetchAgents, fetchTasks, fetchMetrics, deployModalOpen, setDeployModalOpen, metrics } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useWebSocket();

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    fetchAgents();
    fetchTasks();
    fetchMetrics();

    const interval = setInterval(() => {
      fetchMetrics();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.shell} className="app-shell">
      {/* Mobile header */}
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={22} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={styles.logoIcon}><Zap size={16} color="#4f6ef7" /></div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>Workforce.AI</span>
        </div>
        <button className="btn btn-primary" style={{ padding: "8px 12px", fontSize: "13px" }} onClick={() => setDeployModalOpen(true)}>
          <Plus size={14} />
        </button>
      </div>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside style={styles.sidebar} className={sidebarOpen ? "sidebar sidebar-open" : "sidebar"}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}><Zap size={18} color="#4f6ef7" /></div>
          <div>
            <div style={styles.logoText}>Workforce.AI</div>
          </div>
          <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div style={styles.userBadge}>
          <div style={styles.userAvatar}>
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.org || "My Company"}</div>
            <div style={styles.userRole}>{user?.role === "admin" ? "Owner" : user?.role || "Owner"}</div>
          </div>
        </div>

        {/* Hire button */}
        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", marginBottom: "24px", borderRadius: "10px" }}
          onClick={() => setDeployModalOpen(true)}
        >
          <Plus size={16} />
          Hire a Worker
        </button>

        {/* Nav */}
        <nav style={styles.nav}>
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom stats */}
        <div style={styles.sidebarBottom}>
          <div style={styles.bottomStats}>
            <div style={styles.bottomStat}>
              <span style={{ color: "var(--green)", fontSize: "8px" }}>●</span>
              <span>{metrics?.agents?.running || 0} workers active</span>
            </div>
            <div style={styles.bottomStat}>
              <span style={{ color: "var(--accent)", fontSize: "8px" }}>●</span>
              <span>{metrics?.tasks?.running || 0} tasks running</span>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={handleLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main} className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/analytics" element={<Dashboard />} />
        </Routes>
      </main>

      {/* Modals & Toasts */}
      {deployModalOpen && <DeployModal onClose={() => setDeployModalOpen(false)} />}
      <NotificationStack />
    </div>
  );
}

const styles = {
  shell: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "var(--bg-void)",
  },
  sidebar: {
    width: "240px",
    flexShrink: 0,
    background: "#ffffff",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    overflow: "hidden",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "24px",
    paddingBottom: "20px",
    borderBottom: "1px solid var(--border)",
    position: "relative",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    background: "rgba(79, 110, 247, 0.08)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "17px",
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    background: "var(--bg-elevated)",
    borderRadius: "10px",
    marginBottom: "16px",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    background: "linear-gradient(135deg, #4f6ef7, #7c3aed)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 700,
    color: "#ffffff",
    flexShrink: 0,
  },
  userInfo: {},
  userName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "140px",
  },
  userRole: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "10px",
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.15s",
    border: "none",
  },
  navItemActive: {
    background: "var(--accent-glow)",
    color: "var(--accent)",
    fontWeight: 600,
  },
  sidebarBottom: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  bottomStats: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  bottomStat: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  main: {
    flex: 1,
    overflow: "auto",
    background: "var(--bg-void)",
  },
};

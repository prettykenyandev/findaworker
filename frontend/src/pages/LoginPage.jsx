import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { Zap, ArrowRight, Shield, Users, Clock, TrendingUp } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginDemo } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid credentials. Try the demo or use demo@synthetiks.com / demo1234.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await loginDemo();
      navigate("/");
    } catch {
      setError("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="login-container">
      {/* Left side - branding */}
      <div style={styles.leftPanel} className="login-left">
        <div style={styles.brandContent}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>
              <Zap size={24} color="#4f6ef7" />
            </div>
            <span style={styles.logoText}>Synthetiks</span>
          </div>
          <h1 style={styles.heroTitle}>Hire AI workers for your business</h1>
          <p style={styles.heroSub}>
            Deploy customer support agents, data processors, and software engineers — all powered by AI. 
            No recruiting, no onboarding. Just results.
          </p>

          <div style={styles.features}>
            {[
              { icon: Users, title: "AI Software Engineers", desc: "Code generation, PR reviews, tests & docs" },
              { icon: Clock, title: "Instant Deployment", desc: "Workers start in under a second" },
              { icon: TrendingUp, title: "99.7% Uptime", desc: "Reliable AI that works around the clock" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={styles.featureRow}>
                <div style={styles.featureIcon}><Icon size={18} color="#4f6ef7" /></div>
                <div>
                  <div style={styles.featureTitle}>{title}</div>
                  <div style={styles.featureDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div style={styles.rightPanel} className="login-right">
        <div style={styles.formCard} className="animate-fadeInUp">
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSub}>Sign in to manage your AI workers</p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={styles.errorBox}>
                <Shield size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine}></div>
          </div>

          <button
            onClick={handleDemo}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            disabled={loading}
          >
            Try Free Demo
          </button>

          <p style={styles.demoHint}>
            No account needed — explore with sample workers and tasks
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    background: "#ffffff",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
  },
  brandContent: {
    maxWidth: "480px",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "32px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    background: "rgba(79, 110, 247, 0.1)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1a202c",
  },
  heroTitle: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#1a202c",
    lineHeight: 1.2,
    marginBottom: "16px",
  },
  heroSub: {
    fontSize: "16px",
    color: "#5a6578",
    lineHeight: 1.7,
    marginBottom: "40px",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  featureRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },
  featureIcon: {
    width: "40px",
    height: "40px",
    background: "rgba(79, 110, 247, 0.08)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1a202c",
  },
  featureDesc: {
    fontSize: "14px",
    color: "#5a6578",
    marginTop: "2px",
  },
  rightPanel: {
    width: "480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    flexShrink: 0,
  },
  formCard: {
    width: "100%",
    maxWidth: "380px",
  },
  formHeader: {
    marginBottom: "28px",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1a202c",
  },
  formSub: {
    fontSize: "14px",
    color: "#5a6578",
    marginTop: "4px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 14px",
    background: "rgba(239, 68, 68, 0.06)",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    borderRadius: "10px",
    color: "#ef4444",
    fontSize: "13px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
  },
  dividerText: {
    color: "#94a3b8",
    fontSize: "13px",
  },
  demoHint: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "16px",
  },
};

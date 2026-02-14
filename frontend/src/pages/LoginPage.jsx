import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { Bot, ArrowRight, Shield, Users, Clock, TrendingUp } from "lucide-react";

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
              <Bot size={24} color="#00e5ff" />
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
                <div style={styles.featureIcon}><Icon size={18} color="#00e5ff" /></div>
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
    background: "#0a0e1a",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg, #0d1224 0%, #111832 50%, #0a0e1a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    borderRight: "1px solid rgba(255,255,255,0.04)",
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
    background: "rgba(0, 229, 255, 0.1)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 20px rgba(0,229,255,0.15)",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#e8ecf4",
  },
  heroTitle: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#e8ecf4",
    lineHeight: 1.2,
    marginBottom: "16px",
  },
  heroSub: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.5)",
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
    background: "rgba(0, 229, 255, 0.08)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid rgba(0,229,255,0.12)",
  },
  featureTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#e8ecf4",
  },
  featureDesc: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.45)",
    marginTop: "2px",
  },
  rightPanel: {
    width: "480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    flexShrink: 0,
    background: "rgba(12, 17, 30, 0.6)",
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
    color: "#e8ecf4",
  },
  formSub: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.5)",
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
    background: "rgba(255, 51, 102, 0.08)",
    border: "1px solid rgba(255, 51, 102, 0.2)",
    borderRadius: "10px",
    color: "#ff3366",
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
    background: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "13px",
  },
  demoHint: {
    textAlign: "center",
    color: "rgba(255,255,255,0.3)",
    fontSize: "13px",
    marginTop: "16px",
  },
};

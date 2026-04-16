import { useState, useEffect } from "react";
import { login } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

/* ── Animated metric pill for the left panel ── */
const MetricPill = ({ value, label }) => (
  <div
    className="flex flex-col items-center px-5 py-3 rounded-[10px]"
    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
  >
    <span className="text-[22px] font-bold text-white leading-tight">{value}</span>
    <span className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
  </div>
);

/* ── Feature row ── */
const Feature = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    <span className="text-[18px]">{icon}</span>
    <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>{text}</span>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");
    try {
      setLoading(true);
      const data = await login(email, password);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    height: 44,
    padding: "0 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--color-border)",
    fontSize: 14,
    color: "var(--color-text-primary)",
    background: "#f8fafc",
    outline: "none",
    width: "100%",
    transition: "border-color 0.15s",
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ══ LEFT — Dark navy panel ══ */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "#0f172a" }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: "absolute", top: "-120px", right: "-120px",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: "-80px", left: "-80px",
            width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "#2563eb" }}
          >
            <ShieldCheck size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-[18px] tracking-tight">ImpactIQ</span>
        </div>

        {/* Headline block */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-[38px] font-bold text-white leading-[1.15] tracking-tight">
              Crisis Management<br />
              <span style={{ color: "#60a5fa" }}>Intelligence</span> Platform
            </h1>
            <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Real-time volunteer allocation, AI-powered zone analysis, and
              instant field report ingestion — built for operators under pressure.
            </p>
          </div>

          {/* Metric pills */}
          <div className="flex gap-3">
            <MetricPill value="98%" label="Uptime" />
            <MetricPill value="<2s" label="Allocation" />
            <MetricPill value="Gemini" label="AI Engine" />
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            <Feature icon="🗺️" text="Live zone urgency tracking and volunteer placement" />
            <Feature icon="🤖" text="Gemini-powered allocation optimization engine" />
            <Feature icon="📋" text="Field report ingestion with AI extraction" />
            <Feature icon="🔔" text="Real-time alert monitoring and escalation" />
          </div>
        </div>

        {/* Footer */}
        <p className="text-[11px] relative z-10" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 ImpactIQ — Built for critical response teams
        </p>
      </div>

      {/* ══ RIGHT — White form panel ══ */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 py-12 lg:px-16"
        style={{ background: "#fff" }}
      >
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2563eb" }}>
            <ShieldCheck size={15} color="#fff" />
          </div>
          <span className="font-bold text-[16px]" style={{ color: "var(--color-text-primary)" }}>ImpactIQ</span>
        </div>

        <div className="w-full max-w-[380px]">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[26px] font-bold" style={{ color: "var(--color-text-primary)" }}>
              Welcome back
            </h2>
            <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Sign in to your operator account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputBase}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputBase, paddingRight: 42 }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="flex items-center gap-2 text-[13px] px-3 py-2.5 rounded-md"
                style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
              >
                <span>⚠</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 mt-2"
              style={{ background: "#2563eb" }}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
                : "Sign In →"
              }
            </button>
          </form>

          {/* Link to register */}
          <p className="text-center text-[13px] mt-8" style={{ color: "var(--color-text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: "#2563eb" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
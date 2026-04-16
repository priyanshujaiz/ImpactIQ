import { useState, useEffect } from "react";
import { register } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

/* ── Role option card ─────────────────────────────────────────────── */
const ROLES = [
    {
        value: "VOLUNTEER",
        label: "Volunteer",
        emoji: "🙋",
        desc: "On-ground field responder",
    },
    {
        value: "COORDINATOR",
        label: "Coordinator",
        emoji: "📋",
        desc: "Manage assignments & zones",
    },
    {
        value: "SUPERVISOR",
        label: "Supervisor",
        emoji: "🔭",
        desc: "Oversee operations & reports",
    },
    {
        value: "ADMIN",
        label: "Admin",
        emoji: "🛡️",
        desc: "Full system access",
    },
];

const RoleCard = ({ role, selected, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(role.value)}
        className="flex items-start gap-3 p-3 rounded-[10px] text-left transition-all"
        style={{
            border: `1.5px solid ${selected ? "#2563eb" : "var(--color-border)"}`,
            background: selected ? "#eff6ff" : "#f8fafc",
        }}
    >
        <span className="text-[18px] leading-none mt-0.5">{role.emoji}</span>
        <div className="flex-1 min-w-0">
            <p
                className="text-[13px] font-semibold leading-tight"
                style={{ color: selected ? "#1d4ed8" : "var(--color-text-primary)" }}
            >
                {role.label}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {role.desc}
            </p>
        </div>
        {selected && <CheckCircle2 size={15} color="#2563eb" className="shrink-0 mt-0.5" />}
    </button>
);

const Register = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "VOLUNTEER",
    });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) navigate("/dashboard");
    }, []);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name || !form.email || !form.password || !form.role)
            return setError("Please fill in all fields.");
        if (form.password.length < 6)
            return setError("Password must be at least 6 characters.");
        if (form.password !== form.confirmPassword)
            return setError("Passwords do not match.");

        try {
            setLoading(true);
            await register(form.name, form.email, form.password, form.role);
            setSuccess(true);
            // Redirect to login after 1.8s
            setTimeout(() => navigate("/login"), 1800);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Registration failed. Please try again."
            );
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

            {/* ══ LEFT — Dark navy panel (same as Login) ══ */}
            <div
                className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 relative overflow-hidden"
                style={{ background: "#0f172a" }}
            >
                {/* Glows */}
                <div style={{ position: "absolute", top: "-120px", right: "-120px", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

                {/* Logo */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#2563eb" }}>
                        <ShieldCheck size={18} color="#fff" strokeWidth={2.5} />
                    </div>
                    <span className="text-white font-bold text-[18px] tracking-tight">ImpactIQ</span>
                </div>

                {/* Role breakdown */}
                <div className="relative z-10 space-y-6">
                    <div>
                        <h1 className="text-[34px] font-bold text-white leading-[1.15] tracking-tight">
                            Join the<br />
                            <span style={{ color: "#60a5fa" }}>Response Network</span>
                        </h1>
                        <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                            Register with your organizational role to get access to the tools that match your responsibilities.
                        </p>
                    </div>

                    {/* Role legend */}
                    <div className="space-y-3">
                        {ROLES.map((r) => (
                            <div key={r.value} className="flex items-center gap-3">
                                <span className="text-[16px]">{r.emoji}</span>
                                <div>
                                    <span className="text-[13px] font-semibold text-white">{r.label}</span>
                                    <span className="text-[12px] ml-2" style={{ color: "rgba(255,255,255,0.45)" }}>— {r.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-[11px] relative z-10" style={{ color: "rgba(255,255,255,0.3)" }}>
                    © 2026 ImpactIQ — Built for critical response teams
                </p>
            </div>

            {/* ══ RIGHT — Form panel ══ */}
            <div
                className="flex-1 flex flex-col items-center justify-center px-8 py-10 lg:px-12 overflow-y-auto"
                style={{ background: "#fff" }}
            >
                {/* Mobile logo */}
                <div className="flex lg:hidden items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2563eb" }}>
                        <ShieldCheck size={15} color="#fff" />
                    </div>
                    <span className="font-bold text-[16px]" style={{ color: "var(--color-text-primary)" }}>ImpactIQ</span>
                </div>

                <div className="w-full max-w-[420px]">
                    {/* Heading */}
                    <div className="mb-6">
                        <h2 className="text-[24px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                            Create account
                        </h2>
                        <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
                            Register to join the ImpactIQ platform
                        </p>
                    </div>

                    {/* Success state */}
                    {success ? (
                        <div
                            className="flex flex-col items-center gap-3 py-10 text-center rounded-[12px]"
                            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                        >
                            <CheckCircle2 size={36} color="#16a34a" />
                            <p className="text-[15px] font-semibold" style={{ color: "#15803d" }}>
                                Account created!
                            </p>
                            <p className="text-[13px]" style={{ color: "#166534" }}>
                                Redirecting you to login…
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Full Name */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rahul Sharma"
                                    value={form.name}
                                    onChange={set("name")}
                                    style={inputBase}
                                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@organization.com"
                                    value={form.email}
                                    onChange={set("email")}
                                    style={inputBase}
                                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            {/* Password + Confirm */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPwd ? "text" : "password"}
                                            placeholder="Min. 6 chars"
                                            value={form.password}
                                            onChange={set("password")}
                                            style={{ ...inputBase, paddingRight: 38 }}
                                            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                                            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPwd((v) => !v)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2"
                                            tabIndex={-1}
                                            style={{ color: "var(--color-text-muted)" }}
                                        >
                                            {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                                        Confirm
                                    </label>
                                    <input
                                        type={showPwd ? "text" : "password"}
                                        placeholder="Repeat password"
                                        value={form.confirmPassword}
                                        onChange={set("confirmPassword")}
                                        style={inputBase}
                                        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                                        onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Role selector */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                                    Your Role
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ROLES.map((r) => (
                                        <RoleCard
                                            key={r.value}
                                            role={r}
                                            selected={form.role === r.value}
                                            onSelect={(v) => setForm((f) => ({ ...f, role: v }))}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
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
                                className="w-full h-11 rounded-md text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 mt-1"
                                style={{ background: "#2563eb" }}
                            >
                                {loading
                                    ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
                                    : "Create Account →"
                                }
                            </button>

                            {/* Link to login */}
                            <p className="text-center text-[13px]" style={{ color: "var(--color-text-muted)" }}>
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold hover:underline"
                                    style={{ color: "#2563eb" }}
                                >
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;

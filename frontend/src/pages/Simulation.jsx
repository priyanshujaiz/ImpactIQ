import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    FlaskConical, Plus, X, Trash2, ArrowRight,
    TrendingUp, TrendingDown, Minus, Sparkles,
    RefreshCw, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import {
    runSimulation, getSimulations, deleteSimulation, getAllocationHistory,
} from "../services/simulation.service";
import { getZones } from "../services/zone.service";
import { getVolunteers } from "../services/volunteer.service";

import PageHeader from "../components/shared/PageHeader";
import StatusBadge from "../components/shared/StatusBadge";
import EmptyState from "../components/shared/EmptyState";

/* ─── Shared styles ──────────────────────────────────────────────── */
const inputStyle = {
    height: 36, padding: "0 10px", borderRadius: "var(--radius-sm)",
    border: "1px solid var(--color-border)", fontSize: 13,
    color: "var(--color-text-primary)", background: "var(--color-card)",
    outline: "none", width: "100%",
};

const card = {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-card)",
    borderRadius: 14,
};

/* ─── Impact delta badge ────────────────────────────────────────── */
const DeltaBadge = ({ delta }) => {
    if (delta == null) return null;
    const pos = delta > 0;
    const zero = delta === 0;
    const Icon = zero ? Minus : pos ? TrendingUp : TrendingDown;
    const color = zero ? "#64748b" : pos ? "#16a34a" : "#dc2626";
    const bg = zero ? "#f1f5f9" : pos ? "#f0fdf4" : "#fef2f2";
    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold"
            style={{ background: bg, color }}
        >
            <Icon size={12} />
            {pos && "+"}{Number(delta).toFixed(2)}
        </span>
    );
};

/* ─── Section card wrapper ──────────────────────────────────────── */
const Section = ({ title, children, accent }) => (
    <div style={card}>
        {title && (
            <div
                className="px-5 py-3.5 border-b flex items-center gap-2"
                style={{ borderColor: "var(--color-border)", borderLeft: accent ? `4px solid ${accent}` : undefined }}
            >
                <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    {title}
                </span>
            </div>
        )}
        <div className="p-5">{children}</div>
    </div>
);

/* ─── Gemini analysis renderer ──────────────────────────────────── */
const GeminiPanel = ({ analysis }) => {
    let parsed = null;
    try {
        parsed = typeof analysis === "string" ? JSON.parse(analysis) : analysis;
    } catch { parsed = null; }

    if (!parsed) return (
        <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>No AI analysis available.</p>
    );

    const isProposed = parsed.recommendation === "proposed";

    return (
        <div className="flex flex-col gap-4">
            {/* Recommendation badge */}
            <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                    AI Recommendation
                </span>
                <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold"
                    style={{
                        background: isProposed ? "#f0fdf4" : "#fffbeb",
                        color: isProposed ? "#15803d" : "#b45309",
                    }}
                >
                    {isProposed ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                    {isProposed ? "Proposed change is better" : "Keep baseline allocation"}
                </span>
            </div>

            {/* Analysis prose */}
            {parsed.analysis && (
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {parsed.analysis}
                </p>
            )}

            {/* Benefits + Risks grid */}
            <div className="grid grid-cols-2 gap-3">
                {parsed.benefits?.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#16a34a" }}>
                            ✅ Benefits
                        </p>
                        {parsed.benefits.map((b, i) => (
                            <p key={i} className="text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>• {b}</p>
                        ))}
                    </div>
                )}
                {parsed.risks?.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#dc2626" }}>
                            ⚠️ Risks
                        </p>
                        {parsed.risks.map((r, i) => (
                            <p key={i} className="text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>• {r}</p>
                        ))}
                    </div>
                )}
            </div>

            {/* Confidence strip */}
            {(parsed.confidence_baseline != null || parsed.confidence_proposal != null) && (
                <div className="flex gap-4 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                    {parsed.confidence_baseline != null && (
                        <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                            Baseline confidence: <strong style={{ color: "var(--color-text-primary)" }}>
                                {(parsed.confidence_baseline * 100).toFixed(0)}%
                            </strong>
                        </span>
                    )}
                    {parsed.confidence_proposal != null && (
                        <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                            Proposal confidence: <strong style={{ color: "#7c3aed" }}>
                                {(parsed.confidence_proposal * 100).toFixed(0)}%
                            </strong>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
const Simulation = () => {
    /* ── Data ── */
    const [allocations, setAllocations] = useState([]);
    const [zones, setZones] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [history, setHistory] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    /* ── Setup form ── */
    const [baselineId, setBaselineId] = useState("");
    const [changes, setChanges] = useState([{ volunteerId: "", toZone: "" }]);

    /* ── Results ── */
    const [result, setResult] = useState(null);
    const [running, setRunning] = useState(false);

    /* ── Lookup maps ── */
    const zoneMap = Object.fromEntries(zones.map((z) => [z.id, { name: z.name || z.zoneId, code: z.zoneId }]));
    const volMap = Object.fromEntries(volunteers.map((v) => [v.id, v.name]));

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [aRes, zRes, vRes, hRes] = await Promise.all([
                getAllocationHistory(),
                getZones(),
                getVolunteers(),
                getSimulations(),
            ]);
            setAllocations(aRes.data ?? []);
            setZones(zRes.data ?? []);
            setVolunteers(vRes.data ?? []);
            setHistory([...(hRes.data ?? [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

            // Auto-select most recent allocation as baseline
            const sorted = [...(aRes.data ?? [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            if (sorted[0]) setBaselineId(sorted[0].id);
        } catch {
            toast.error("Failed to load simulation data.");
        } finally {
            setPageLoading(false);
        }
    };

    /* ── Change row helpers ── */
    const addChange = () => setChanges((c) => [...c, { volunteerId: "", toZone: "" }]);
    const removeChange = (i) => setChanges((c) => c.filter((_, idx) => idx !== i));
    const updateChange = (i, k, v) =>
        setChanges((c) => c.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

    /* ── Run simulation ── */
    const handleRun = async () => {
        if (!baselineId) return toast.error("Select a baseline allocation first.");
        const valid = changes.filter((c) => c.volunteerId && c.toZone);
        if (valid.length === 0) return toast.error("Add at least one valid volunteer movement.");

        setRunning(true);
        setResult(null);
        const toastId = toast.loading("Running simulation with AI engine…");
        try {
            // proposedChanges: backend expects { volunteerId, toZone } where toZone = zones.id (UUID)
            const res = await runSimulation(baselineId, valid.map((c) => ({
                volunteerId: c.volunteerId,
                toZone: c.toZone,
            })));
            setResult(res.data.simulation);
            toast.success("Simulation complete!", { id: toastId });
            // Refresh history
            const hRes = await getSimulations();
            setHistory([...(hRes.data ?? [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            toast.error(err?.response?.data?.error ?? "Simulation failed.", { id: toastId });
        } finally {
            setRunning(false);
        }
    };

    /* ── Delete simulation ── */
    const handleDelete = async (id) => {
        if (!confirm("Delete this simulation run?")) return;
        try {
            await deleteSimulation(id);
            setHistory((h) => h.filter((s) => s.id !== id));
            if (result?.id === id) setResult(null);
            toast.success("Simulation deleted.");
        } catch (err) {
            toast.error(err?.response?.data?.error ?? "Failed to delete.");
        }
    };

    if (pageLoading) {
        return (
            <div className="space-y-5">
                <div className="shimmer rounded-[14px]" style={{ height: 60 }} />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    <div className="lg:col-span-2 shimmer rounded-[14px]" style={{ height: 400 }} />
                    <div className="lg:col-span-3 shimmer rounded-[14px]" style={{ height: 400 }} />
                </div>
            </div>
        );
    }

    /* ── Result values ── */
    const sim = result;
    const impactDir = sim ? (sim.impactDelta > 0 ? "up" : sim.impactDelta < 0 ? "down" : "flat") : null;

    return (
        <div className="space-y-5">
            <PageHeader
                title="What-If Simulation"
                subtitle="Model volunteer movements before committing to the live allocation"
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

                {/* ══════════════════════════════════════
            LEFT — Setup panel (40%)
        ══════════════════════════════════════ */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* 1. Baseline picker */}
                    <Section title="Baseline Allocation">
                        {allocations.length === 0 ? (
                            <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
                                No allocations found. Run an allocation first.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                                    Choose the allocation plan to compare against
                                </p>
                                <select
                                    value={baselineId}
                                    onChange={(e) => setBaselineId(e.target.value)}
                                    style={{ ...inputStyle, cursor: "pointer" }}
                                >
                                    <option value="">— Select allocation —</option>
                                    {allocations.map((a) => {
                                        const date = a.createdAt
                                            ? (() => { try { return format(new Date(a.createdAt), "dd MMM HH:mm"); } catch { return a.id?.slice(0, 8); } })()
                                            : a.id?.slice(0, 8);
                                        const count = a.allocationPlan?.length ?? "?";
                                        return (
                                            <option key={a.id} value={a.id}>
                                                {date} · {count} assignments
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        )}
                    </Section>

                    {/* 2. Change builder */}
                    <Section title="Proposed Movements">
                        <div className="flex flex-col gap-3">
                            {changes.map((row, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    {/* Volunteer picker */}
                                    <select
                                        value={row.volunteerId}
                                        onChange={(e) => updateChange(i, "volunteerId", e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    >
                                        <option value="">Volunteer…</option>
                                        {volunteers.map((v) => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </select>

                                    {/* Arrow */}
                                    <ArrowRight size={14} color="#94a3b8" className="shrink-0" />

                                    {/* Target zone picker */}
                                    <select
                                        value={row.toZone}
                                        onChange={(e) => updateChange(i, "toZone", e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    >
                                        <option value="">Target zone…</option>
                                        {zones.map((z) => (
                                            <option key={z.id} value={z.id}>{z.name || z.zoneId}</option>
                                        ))}
                                    </select>

                                    {/* Remove row */}
                                    {changes.length > 1 && (
                                        <button
                                            onClick={() => removeChange(i)}
                                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#fee2e2] transition-colors shrink-0"
                                        >
                                            <X size={12} color="#dc2626" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Add row */}
                            <button
                                onClick={addChange}
                                className="flex items-center gap-1.5 text-[12px] font-semibold hover:opacity-75 transition-opacity mt-1"
                                style={{ color: "var(--color-primary)" }}
                            >
                                <Plus size={13} />
                                Add Movement
                            </button>
                        </div>
                    </Section>

                    {/* Run button */}
                    <button
                        onClick={handleRun}
                        disabled={running || !baselineId}
                        className="flex items-center justify-center gap-2 h-11 rounded-[10px] text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                        style={{ background: "#7c3aed" }}
                    >
                        {running
                            ? <><RefreshCw size={14} className="animate-spin" /> Running simulation…</>
                            : <><FlaskConical size={14} /> Run What-If Simulation</>
                        }
                    </button>
                </div>

                {/* ══════════════════════════════════════
            RIGHT — Results + History (60%)
        ══════════════════════════════════════ */}
                <div className="lg:col-span-3 flex flex-col gap-4">

                    {/* Results panel */}
                    {!sim ? (
                        <div style={card}>
                            <div className="py-14 flex flex-col items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ background: "#f5f3ff" }}
                                >
                                    <FlaskConical size={22} color="#7c3aed" />
                                </div>
                                <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                    No simulation run yet
                                </p>
                                <p className="text-[13px] text-center max-w-xs" style={{ color: "var(--color-text-muted)" }}>
                                    Build your proposed volunteer movements on the left and click Run.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Impact metrics strip */}
                            <div style={card}>
                                <div
                                    className="px-5 py-3.5 border-b"
                                    style={{ borderColor: "var(--color-border)", borderLeft: "4px solid #7c3aed" }}
                                >
                                    <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                                        Impact Comparison
                                    </span>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-3 gap-4">
                                        {/* Baseline */}
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                                                Baseline
                                            </p>
                                            <p className="text-[26px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                                                {sim.baselineImpact != null ? Number(sim.baselineImpact).toFixed(1) : "—"}
                                            </p>
                                        </div>

                                        {/* Arrow + delta */}
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <ArrowRight size={18} color="#94a3b8" />
                                            <DeltaBadge delta={sim.impactDelta} />
                                        </div>

                                        {/* Simulated */}
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                                                Simulated
                                            </p>
                                            <p
                                                className="text-[26px] font-bold"
                                                style={{ color: impactDir === "up" ? "#16a34a" : impactDir === "down" ? "#dc2626" : "var(--color-text-primary)" }}
                                            >
                                                {sim.simulatedImpact != null ? Number(sim.simulatedImpact).toFixed(1) : "—"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Efficiency + confidence strip */}
                                    <div
                                        className="flex items-center gap-5 mt-4 pt-4 border-t flex-wrap"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        {sim.proposalEfficiency != null && (
                                            <span className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                                                Efficiency&nbsp;
                                                <strong style={{ color: "#7c3aed" }}>{Number(sim.proposalEfficiency).toFixed(1)}%</strong>
                                            </span>
                                        )}
                                        {sim.aiConfidence != null && (
                                            <span className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                                                AI Confidence&nbsp;
                                                <strong style={{ color: "var(--color-text-primary)" }}>
                                                    {(Number(sim.aiConfidence) * 100).toFixed(0)}%
                                                </strong>
                                            </span>
                                        )}

                                        {/* Proposed changes recap */}
                                        {sim.proposedChanges?.length > 0 && (
                                            <span className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                                                {sim.proposedChanges.length} movement{sim.proposedChanges.length !== 1 ? "s" : ""} modelled
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Gemini AI analysis */}
                            <div style={{ ...card, borderLeft: "4px solid #7c3aed" }}>
                                <div
                                    className="px-5 py-3.5 border-b flex items-center gap-2"
                                    style={{ borderColor: "var(--color-border)" }}
                                >
                                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "#f5f3ff" }}>
                                        <Sparkles size={11} color="#7c3aed" />
                                    </div>
                                    <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "#7c3aed" }}>
                                        AI Trade-off Analysis
                                    </span>
                                </div>
                                <div className="p-5">
                                    <GeminiPanel analysis={sim.geminiAnalysis} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Simulation History ── */}
                    <div style={card}>
                        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                            <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                                Simulation History
                            </span>
                            {history.length > 0 && (
                                <span
                                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
                                >
                                    {history.length} run{history.length !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                        <div className="p-3">
                            {history.length === 0 ? (
                                <div className="py-6">
                                    <EmptyState
                                        icon={<Clock size={18} color="#94a3b8" />}
                                        message="No past simulations yet. Run your first above."
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {history.map((s) => {
                                        let gemParsed = null;
                                        try { gemParsed = JSON.parse(s.geminiAnalysis); } catch { gemParsed = null; }
                                        const rec = gemParsed?.recommendation;
                                        const timeAgo = (() => { try { return formatDistanceToNow(new Date(s.createdAt), { addSuffix: true }); } catch { return ""; } })();

                                        return (
                                            <div
                                                key={s.id}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] hover:bg-[var(--color-card-bg)] transition-colors cursor-pointer"
                                                onClick={() => setResult(s)}
                                            >
                                                {/* Time */}
                                                <span className="text-[11px] shrink-0 w-20" style={{ color: "var(--color-text-muted)" }}>{timeAgo}</span>

                                                {/* Delta */}
                                                <div className="shrink-0">
                                                    <DeltaBadge delta={s.impactDelta} />
                                                </div>

                                                {/* Changes count */}
                                                <span className="text-[12px] flex-1 truncate" style={{ color: "var(--color-text-secondary)" }}>
                                                    {s.proposedChanges?.length ?? 0} movement{(s.proposedChanges?.length ?? 0) !== 1 ? "s" : ""}
                                                    {rec && <span className="ml-2 font-medium" style={{ color: rec === "proposed" ? "#16a34a" : "#b45309" }}>
                                                        · {rec === "proposed" ? "✅ Apply" : "⚠️ Keep baseline"}
                                                    </span>}
                                                </span>

                                                {/* Efficiency */}
                                                {s.proposalEfficiency != null && (
                                                    <span className="text-[11px] shrink-0" style={{ color: "var(--color-text-muted)" }}>
                                                        {Number(s.proposalEfficiency).toFixed(1)}%
                                                    </span>
                                                )}

                                                {/* Delete */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                                                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#fee2e2] transition-colors shrink-0"
                                                >
                                                    <Trash2 size={11} color="#dc2626" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Simulation;

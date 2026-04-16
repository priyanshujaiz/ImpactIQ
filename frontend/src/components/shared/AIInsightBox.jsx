import { Sparkles, TrendingUp } from "lucide-react";

/**
 * AIInsightBox (shared)
 *
 * Dashboard usage: shows compact `dashboard_insight` + key stats strip
 * Allocation usage: shows `global_summary` + per-assignment bullets
 *
 * Props:
 *   allocation  – allocation object (geminiExplanation is JSON string or object)
 *   isLoading   – shimmer skeleton while AI is thinking
 *   compact     – if true (dashboard), show dashboard_insight only (default false)
 */
const AIInsightBox = ({ allocation, isLoading = false, compact = false }) => {
    // Parse geminiExplanation safely
    let parsed = null;
    if (allocation?.geminiExplanation) {
        try {
            parsed =
                typeof allocation.geminiExplanation === "string"
                    ? JSON.parse(allocation.geminiExplanation)
                    : allocation.geminiExplanation;
        } catch {
            parsed = null;
        }
    }

    // Choose what to show: compact mode → dashboard_insight, full mode → global_summary + assignments
    const dashboardText = parsed?.dashboard_insight || parsed?.global_summary;
    const assignments = Array.isArray(parsed?.assignments) ? parsed.assignments : [];
    const plan = Array.isArray(allocation?.allocationPlan) ? allocation.allocationPlan : [];

    return (
        <div
            className="rounded-[14px] overflow-hidden h-full flex flex-col"
            style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-card)",
                borderLeft: "4px solid #7c3aed",
            }}
        >
            {/* Header */}
            <div
                className="flex items-center gap-2 px-5 py-4 border-b shrink-0"
                style={{ borderColor: "var(--color-border)" }}
            >
                <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: "#f5f3ff" }}
                >
                    <Sparkles size={13} color="#7c3aed" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-semibold" style={{ color: "#7c3aed" }}>
                    AI Insights — Gemini
                </span>
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex flex-col gap-3 flex-1 min-h-0">
                {isLoading ? (
                    // Shimmer skeleton
                    <div className="space-y-3">
                        <div className="shimmer h-4 rounded w-3/4" />
                        <div className="shimmer h-4 rounded w-full" />
                        <div className="shimmer h-4 rounded w-5/6" />
                        <div className="mt-2 space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="shimmer h-3 rounded" style={{ width: `${70 + i * 8}%` }} />
                            ))}
                        </div>
                    </div>
                ) : !parsed ? (
                    <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
                        Run allocation to generate AI-powered insights.
                    </p>
                ) : compact ? (
                    /* ── COMPACT MODE (Dashboard card) ── */
                    <>
                        {/* Dashboard insight — clean prose, no IDs */}
                        <p
                            className="text-[13px] leading-relaxed"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {dashboardText ?? "Allocation complete. Review assignments in the Allocation page."}
                        </p>

                        {/* Quick stat strip */}
                        {plan.length > 0 && (
                            <div
                                className="flex items-center gap-4 mt-auto pt-3 border-t"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp size={11} color="#7c3aed" />
                                    <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-muted)" }}>
                                        {plan.length} assignment{plan.length !== 1 ? "s" : ""} generated
                                    </span>
                                </div>
                                {allocation?.totalImpact != null && (
                                    <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-muted)" }}>
                                        Impact <strong style={{ color: "#7c3aed" }}>{Number(allocation.totalImpact).toFixed(1)}</strong>
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* ── FULL MODE (Allocation page) ── */
                    <>
                        {/* Global summary */}
                        {parsed.global_summary && (
                            <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                {parsed.global_summary}
                            </p>
                        )}

                        {/* Per-assignment bullets */}
                        {assignments.length > 0 && (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {assignments.map((a, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-2 text-[12px] leading-relaxed"
                                        style={{ color: "var(--color-text-secondary)", animationDelay: `${i * 60}ms` }}
                                    >
                                        <span className="mt-0.5 shrink-0" style={{ color: "#7c3aed" }}>•</span>
                                        <span>
                                            <strong style={{ color: "var(--color-text-primary)" }}>
                                                {a.volunteer_name ?? a.volunteer_id ?? a.volunteerId ?? "Volunteer"}
                                            </strong>{" "}
                                            → {a.zone_name ?? a.zone_id ?? a.zoneId ?? "Zone"}
                                            {/* Handle both 'reason' and 'reasoning' field names from Gemini */}
                                            {(a.reason || a.reasoning) && (
                                                <span style={{ color: "var(--color-text-muted)" }}>
                                                    {" "}— {a.reason ?? a.reasoning}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AIInsightBox;

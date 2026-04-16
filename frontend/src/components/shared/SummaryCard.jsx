import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";

/**
 * SummaryCard
 * @param {string}  title     - Card label (e.g. "Volunteers")
 * @param {any}     value     - Main metric value
 * @param {string}  [trend]   - e.g. "↑ 4.4% vs last period"
 * @param {"up"|"down"|"neutral"} [trendDir]
 * @param {ReactNode} [icon]  - Lucide icon element
 * @param {boolean} [danger]  - Makes the value render in red (for Alerts card)
 */
const SummaryCard = ({ title, value, trend, trendDir = "neutral", icon, danger = false }) => {
    const trendColors = {
        up: { text: "#16a34a", bg: "#dcfce7" },
        down: { text: "#dc2626", bg: "#fee2e2" },
        neutral: { text: "#64748b", bg: "#f1f5f9" },
    };

    const { text: trendText, bg: trendBg } = trendColors[trendDir];

    return (
        <div
            className="rounded-[14px] p-5 flex flex-col gap-3"
            style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-card)",
            }}
        >
            {/* Top row: label + icon */}
            <div className="flex items-center justify-between">
                <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    {title}
                </span>
                {icon && (
                    <span
                        className="w-7 h-7 rounded-md flex items-center justify-center"
                        style={{ background: "var(--color-card-bg)" }}
                    >
                        {icon}
                    </span>
                )}
            </div>

            {/* Value */}
            <p
                className="text-[28px] font-bold leading-none tracking-tight"
                style={{ color: danger ? "var(--color-danger)" : "var(--color-text-primary)" }}
            >
                {value ?? "—"}
            </p>

            {/* Trend */}
            {trend && (
                <div
                    className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ color: trendText, background: trendBg }}
                >
                    {trendDir === "up" && <TrendingUp size={11} />}
                    {trendDir === "down" && <TrendingDown size={11} />}
                    {trendDir === "neutral" && <Minus size={11} />}
                    {trend}
                </div>
            )}
        </div>
    );
};

export default SummaryCard;

/**
 * UrgencyBar
 * 4px full-width colored top strip for zone cards.
 * Maps urgency level number or string to a semantic color.
 */
const URGENCY_COLORS = {
    // String labels
    critical: "#dc2626",
    high: "#d97706",
    medium: "#2563eb",
    low: "#16a34a",
    // Numeric urgency (1–5 scale if used)
    5: "#dc2626",
    4: "#dc2626",
    3: "#d97706",
    2: "#2563eb",
    1: "#16a34a",
};

const UrgencyBar = ({ urgency }) => {
    const key = typeof urgency === "string" ? urgency.toLowerCase() : urgency;
    const color = URGENCY_COLORS[key] ?? "#94a3b8";

    return (
        <div
            style={{
                height: "4px",
                background: color,
                borderRadius: "14px 14px 0 0",
                width: "100%",
                flexShrink: 0,
            }}
        />
    );
};

export default UrgencyBar;

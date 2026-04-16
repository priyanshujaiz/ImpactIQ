import { clsx } from "clsx";

/**
 * StatusBadge
 * Maps a status string to a semantic color pill.
 * @param {"critical"|"high"|"medium"|"low"|"available"|"busy"|"processed"|"pending"|"failed"|string} status
 * @param {string} [className]
 */
const STATUS_MAP = {
    critical: { label: "Critical", bg: "#fee2e2", color: "#dc2626" },
    high: { label: "High", bg: "#fef3c7", color: "#d97706" },
    medium: { label: "Medium", bg: "#dbeafe", color: "#2563eb" },
    low: { label: "Low", bg: "#dcfce7", color: "#16a34a" },
    available: { label: "Available", bg: "#dcfce7", color: "#16a34a" },
    busy: { label: "Busy", bg: "#fef3c7", color: "#d97706" },
    processed: { label: "Processed", bg: "#dcfce7", color: "#16a34a" },
    pending: { label: "Pending", bg: "#fef3c7", color: "#d97706" },
    failed: { label: "Failed", bg: "#fee2e2", color: "#dc2626" },
    active: { label: "Active", bg: "#dcfce7", color: "#16a34a" },
    inactive: { label: "Inactive", bg: "#f1f5f9", color: "#64748b" },
};

const StatusBadge = ({ status, className }) => {
    const normalized = (status || "").toLowerCase();
    const { label, bg, color } = STATUS_MAP[normalized] ?? {
        label: status ?? "Unknown",
        bg: "#f1f5f9",
        color: "#64748b",
    };

    return (
        <span
            className={clsx(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-none whitespace-nowrap",
                className
            )}
            style={{ background: bg, color }}
        >
            {label}
        </span>
    );
};

export default StatusBadge;

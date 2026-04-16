import { MapPin } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

/**
 * ZonesPreview
 * Uses getZoneMetrics shape: { id, zoneId, urgency (1-10), needScore, currentVolunteers, status }
 */
const urgencyLabel = (u) => {
  if (u >= 8) return "critical";
  if (u >= 5) return "high";
  if (u >= 3) return "medium";
  return "low";
};

// Small inline color dot — NOT UrgencyBar (which is width:100% and breaks flex rows)
const URGENCY_COLORS = {
  critical: "#dc2626",
  high: "#d97706",
  medium: "#2563eb",
  low: "#16a34a",
};

const UrgencyDot = ({ urgency }) => (
  <span
    style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: URGENCY_COLORS[urgency] ?? "#94a3b8",
      flexShrink: 0,
    }}
  />
);

const ZonesPreview = ({ zones = [] }) => {
  const top = [...zones].sort((a, b) => b.urgency - a.urgency).slice(0, 5);

  return (
    <div
      className="rounded-[14px] flex flex-col"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h3 className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Critical Zones
        </h3>
        <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
          Top {top.length} by urgency
        </span>
      </div>

      {/* List */}
      <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        {top.length === 0 ? (
          <p className="text-[13px] text-center py-8" style={{ color: "var(--color-text-muted)" }}>
            No zones available
          </p>
        ) : (
          top.map((z) => {
            const label = urgencyLabel(z.urgency);
            return (
              <div key={z.id} className="px-4 py-3 flex items-center gap-3">
                {/* Urgency dot (replaces UrgencyBar — which was breaking the row) */}
                <UrgencyDot urgency={label} />

                {/* Zone ID */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <MapPin size={11} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <span className="text-[13px] font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                    {z.zoneId}
                  </span>
                </div>

                {/* Urgency badge */}
                <StatusBadge status={label} />

                {/* Volunteer count */}
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {z.currentVolunteers ?? 0} vol{z.currentVolunteers !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ZonesPreview;
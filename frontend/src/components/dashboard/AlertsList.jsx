import { format, formatDistanceToNow } from "date-fns";
import StatusBadge from "../shared/StatusBadge";
import { AlertTriangle, CheckCircle } from "lucide-react";

/**
 * AlertsList
 * @param {Array<{id, zoneId, type, message, suggestedAction, status, createdAt}>} alerts
 */
const AlertsList = ({ alerts = [] }) => {
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
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h3 className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Active Alerts
        </h3>
        {alerts.length > 0 && (
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
          >
            {alerts.length} active
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "var(--color-border)" }}>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <CheckCircle size={22} color="#16a34a" />
            <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
              No active alerts
            </p>
          </div>
        ) : (
          alerts.slice(0, 5).map((a) => (
            <div key={a.id} className="px-5 py-3 flex gap-3">
              {/* Icon */}
              <div className="mt-0.5 shrink-0">
                <AlertTriangle
                  size={14}
                  color={a.type === "critical" ? "#dc2626" : "#d97706"}
                />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={a.type} />
                  <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                    {a.createdAt
                      ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })
                      : ""}
                  </span>
                </div>
                <p className="text-[12px] mt-1 leading-snug truncate" style={{ color: "var(--color-text-secondary)" }}>
                  {a.message}
                </p>
                {a.suggestedAction && (
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>
                    → {a.suggestedAction}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsList;
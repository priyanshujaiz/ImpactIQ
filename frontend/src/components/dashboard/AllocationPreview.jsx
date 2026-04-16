import { format, formatDistanceToNow } from "date-fns";
import { Zap, ArrowRight } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

/**
 * AllocationPreview
 * allocation: { id, allocationPlan[{volunteerId, zoneId, impactScore, suitability}], totalImpactScore, triggeredBy, createdAt }
 * zoneMap:    { [id]: name }   — passed from Dashboard
 * volMap:     { [id]: name }   — passed from Dashboard
 */
const AllocationPreview = ({ allocation, zoneMap = {}, volMap = {} }) => {
  if (!allocation) {
    return (
      <div
        className="rounded-[14px] flex flex-col items-center justify-center py-10 gap-2"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <Zap size={22} color="#94a3b8" />
        <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
          No allocation generated yet
        </p>
        <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
          Go to Allocation page to run engine
        </p>
      </div>
    );
  }

  const plan = allocation.allocationPlan ?? [];

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
          Current Allocation
        </h3>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
          >
            {plan.length} assigned
          </span>
          <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
            Score <strong style={{ color: "var(--color-text-primary)" }}>
              {allocation.totalImpactScore?.toFixed(1)}
            </strong>
          </span>
        </div>
      </div>

      {/* Timestamp row */}
      {allocation.createdAt && (
        <div className="px-5 pt-2.5 pb-0">
          <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
            {(() => { try { return formatDistanceToNow(new Date(allocation.createdAt), { addSuffix: true }); } catch { return ""; } })()}
            {" · "}
            <span className="capitalize">{allocation.triggeredBy}</span>
          </p>
        </div>
      )}

      {/* Assignments */}
      <div className="divide-y mt-2" style={{ borderColor: "var(--color-border)" }}>
        {plan.length === 0 ? (
          <p className="text-[12px] text-center py-6" style={{ color: "var(--color-text-muted)" }}>
            No assignments in plan
          </p>
        ) : (
          plan.slice(0, 5).map((item, i) => {
            const volName = volMap[item.volunteerId] ?? "Unknown";
            const zoneName = zoneMap[item.zoneId] ?? item.zoneId?.slice(0, 8) + "…";
            const suitability = typeof item.suitability === "string"
              ? item.suitability.toLowerCase()
              : item.suitability >= 80 ? "high" : item.suitability >= 50 ? "medium" : "low";

            return (
              <div key={i} className="px-5 py-2.5 flex items-center gap-2">
                {/* Vol → Zone */}
                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <span className="text-[12px] font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                    {volName}
                  </span>
                  <ArrowRight size={11} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <span className="text-[12px] truncate" style={{ color: "var(--color-text-secondary)" }}>
                    {zoneName}
                  </span>
                </div>

                {/* Right: impact + suitability */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.impactScore != null && (
                    <span className="text-[11px] font-semibold" style={{ color: "var(--color-primary)" }}>
                      {Number(item.impactScore).toFixed(1)}
                    </span>
                  )}
                  <StatusBadge status={suitability} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AllocationPreview;
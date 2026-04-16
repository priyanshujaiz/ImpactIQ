import { format } from "date-fns";
import { Zap, Clock, User } from "lucide-react";

/**
 * AllocationSummary — 3-stat strip
 * Fields: { totalImpactScore, triggeredBy, createdAt }
 */
const Stat = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-center gap-3 flex-1 min-w-0 px-5 py-4">
    <div
      className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
      style={{ background: accent + "22" }}
    >
      <Icon size={15} color={accent} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <p className="text-[15px] font-bold truncate" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
    </div>
  </div>
);

const AllocationSummary = ({ allocation }) => {
  if (!allocation) return null;

  const createdAt = allocation.createdAt
    ? (() => { try { return format(new Date(allocation.createdAt), "dd MMM yyyy, HH:mm"); } catch { return "—"; } })()
    : "—";

  return (
    <div
      className="rounded-[14px] flex flex-wrap divide-x"
      style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-border)",
        divideColor: "var(--color-border)",
      }}
    >
      <Stat
        icon={Zap}
        label="Total Impact Score"
        value={allocation.totalImpactScore != null ? Number(allocation.totalImpactScore).toFixed(2) : "—"}
        accent="#2563eb"
      />
      <Stat
        icon={User}
        label="Triggered By"
        value={allocation.triggeredBy ?? "—"}
        accent="#7c3aed"
      />
      <Stat
        icon={Clock}
        label="Generated At"
        value={createdAt}
        accent="#0ea5e9"
      />
    </div>
  );
};

export default AllocationSummary;
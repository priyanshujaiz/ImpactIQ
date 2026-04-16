import DataTable from "../shared/DataTable";
import StatusBadge from "../shared/StatusBadge";

/**
 * AllocationTable
 * allocationPlan: [{ volunteerId, zoneId, impactScore, suitability }]
 * zones[]:        [{ id, name, zoneId }]
 * volunteers[]:   [{ id, name }]
 */
const suitabilityBadge = (s) => {
  if (s == null) return "—";
  const val = Number(s);
  // Engine returns 0–1 float (e.g. 0.73 = 73%)
  if (val >= 0.7) return "high";
  if (val >= 0.4) return "medium";
  return "low";
};

const AllocationTable = ({ allocation, zones = [], volunteers = [] }) => {
  // Build lookup maps
  const zoneMap = Object.fromEntries(zones.map((z) => [z.id, z.name ?? z.zoneId]));
  const volMap = Object.fromEntries(volunteers.map((v) => [v.id, v.name]));

  const plan = allocation?.allocationPlan ?? [];

  // Enrich rows with id for DataTable key
  const rows = plan.map((item, i) => ({ ...item, id: `${item.volunteerId}-${i}` }));

  const columns = [
    {
      key: "volunteerId",
      label: "Volunteer",
      sortable: true,
      render: (val) => (
        <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
          {volMap[val] ?? val?.slice(0, 8) + "…"}
        </span>
      ),
    },
    {
      key: "zoneId",
      label: "Assigned Zone",
      sortable: true,
      render: (val) => (
        <span style={{ color: "var(--color-text-secondary)" }}>
          {zoneMap[val] ?? val?.slice(0, 8) + "…"}
        </span>
      ),
    },
    {
      key: "impactScore",
      label: "Impact Score",
      sortable: true,
      render: (val) => (
        <span className="font-semibold" style={{ color: "var(--color-primary)" }}>
          {val != null ? Number(val).toFixed(2) : "—"}
        </span>
      ),
    },
    {
      key: "suitability",
      label: "Suitability",
      sortable: true,
      render: (val) => {
        const num = Number(val);
        const label = suitabilityBadge(num);
        const pct = val != null ? `${Math.round(num * 100)}%` : "—";
        return (
          <span className="flex items-center gap-2">
            <StatusBadge status={label} />
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{pct}</span>
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      emptyState={
        <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
          No assignments — run allocation first.
        </span>
      }
    />
  );
};

export default AllocationTable;
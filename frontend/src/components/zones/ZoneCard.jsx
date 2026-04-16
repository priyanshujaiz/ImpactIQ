import { useState } from "react";
import { Pencil, Trash2, Users, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import UrgencyBar from "../shared/UrgencyBar";
import StatusBadge from "../shared/StatusBadge";
import { getZoneVolunteers } from "../../services/zone.service";

const urgencyLabel = (u) => {
  if (u >= 8) return "critical";
  if (u >= 5) return "high";
  if (u >= 3) return "medium";
  return "low";
};

/**
 * ZoneCard
 * Fields: { id, name, zoneId, urgency(1-10), needScore, severity,
 *           needType[], peopleAffected, currentVolunteers, lat, lng }
 */
const ZoneCard = ({ zone, onEdit, onDelete }) => {
  const label = urgencyLabel(zone.urgency);

  // ── Feature 3: volunteers panel ──
  const [showVols, setShowVols] = useState(false);
  const [vols, setVols] = useState([]);
  const [volsLoading, setVolsLoading] = useState(false);

  const toggleVolunteers = async () => {
    if (!showVols && vols.length === 0) {
      setVolsLoading(true);
      try {
        const res = await getZoneVolunteers(zone.id);
        setVols(res.data ?? []);
      } catch {
        setVols([]);
      } finally {
        setVolsLoading(false);
      }
    }
    setShowVols((v) => !v);
  };

  return (
    <div
      className="rounded-[10px] flex flex-col overflow-hidden"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <UrgencyBar urgency={label} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold leading-tight truncate" style={{ color: "var(--color-text-primary)" }}>
              {zone.name}
            </h3>
            <p className="text-[11px] mt-0.5 font-mono truncate" style={{ color: "var(--color-text-muted)" }}>
              {zone.zoneId}
            </p>
          </div>
          <StatusBadge status={label} />
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium" style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)" }}>
            Score&nbsp;<strong style={{ color: "var(--color-text-primary)" }}>{zone.needScore != null ? Number(zone.needScore).toFixed(1) : "—"}</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium" style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)" }}>
            Severity&nbsp;<strong style={{ color: "var(--color-text-primary)" }}>{zone.severity ?? "—"}</strong>
          </span>
          {zone.peopleAffected != null && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium" style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)" }}>
              People&nbsp;<strong style={{ color: "var(--color-text-primary)" }}>{zone.peopleAffected}</strong>
            </span>
          )}
        </div>

        {/* Need type tags */}
        {zone.needType?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {zone.needType.map((n, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                {n}
              </span>
            ))}
          </div>
        )}

        {/* ── Volunteers toggle panel (Feature 3) ── */}
        <button
          onClick={toggleVolunteers}
          className="flex items-center gap-1.5 text-[11px] font-semibold transition-opacity hover:opacity-70 mt-1"
          style={{ color: "var(--color-primary)" }}
        >
          <Users size={11} />
          {zone.currentVolunteers ?? 0} volunteer{zone.currentVolunteers !== 1 ? "s" : ""} assigned
          {showVols ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {showVols && (
          <div
            className="rounded-md p-3 flex flex-col gap-1.5"
            style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-border)" }}
          >
            {volsLoading ? (
              <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
            ) : vols.length === 0 ? (
              <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>No volunteers currently assigned.</p>
            ) : (
              vols.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={10} color="#94a3b8" />
                    <span className="text-[12px] font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{v.name}</span>
                  </div>
                  <StatusBadge status={v.availability} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t mt-auto gap-1" style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={() => onEdit(zone)}
            title="Edit zone"
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[#dbeafe]"
          >
            <Pencil size={13} color="#2563eb" />
          </button>
          <button
            onClick={() => onDelete(zone.id)}
            title="Delete zone"
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[#fee2e2]"
          >
            <Trash2 size={13} color="#dc2626" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZoneCard;
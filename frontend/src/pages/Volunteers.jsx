import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Users, MapPin, UserX } from "lucide-react";

import {
  getVolunteers, createVolunteer, deleteVolunteer,
  assignVolunteer, unassignVolunteer, updateLocation,
} from "../services/volunteer.service";
import { getZones } from "../services/zone.service";

import DataTable from "../components/shared/DataTable";
import StatusBadge from "../components/shared/StatusBadge";
import Modal from "../components/shared/Modal";
import PageHeader from "../components/shared/PageHeader";
import EmptyState from "../components/shared/EmptyState";
import VolunteerForm from "../components/volunteers/VolunteerForm";

/* ─────────────────────── shared input style ─────────────────────── */
const inputStyle = {
  height: 36, padding: "0 10px", borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border)", fontSize: 13,
  color: "var(--color-text-primary)", background: "var(--color-card)",
  outline: "none", width: "100%",
};

/* ── Pill filter tab ──────────────────────────────────────────────── */
const FilterTab = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors"
    style={{
      background: active ? "var(--color-primary)" : "var(--color-card)",
      color: active ? "#fff" : "var(--color-text-secondary)",
      border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
    }}
  >
    {label}
    <span
      className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
      style={{
        background: active ? "rgba(255,255,255,0.25)" : "var(--color-card-bg)",
        color: active ? "#fff" : "var(--color-text-muted)",
      }}
    >
      {count}
    </span>
  </button>
);

/* ── Assign Zone modal ────────────────────────────────────────────── */
const AssignModalContent = ({ zones, onAssign, loading }) => {
  const [zoneId, setZoneId] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Select Zone
        </label>
        <select
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="">— Choose a zone —</option>
          {zones.map((z) => (
            <option key={z.id} value={z.zoneId}>
              {z.name} ({z.zoneId})
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => zoneId && onAssign(zoneId)}
        disabled={!zoneId || loading}
        className="w-full h-9 rounded-md text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--color-primary)" }}
      >
        {loading ? "Assigning…" : "Confirm Assignment"}
      </button>
    </div>
  );
};

/* ── Update Location modal ────────────────────────────────────────── */
const LocationModalContent = ({ onSave, loading }) => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Latitude
          </label>
          <input
            type="number" step="any" placeholder="22.31"
            value={lat} onChange={(e) => setLat(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Longitude
          </label>
          <input
            type="number" step="any" placeholder="87.32"
            value={lng} onChange={(e) => setLng(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
      <button
        onClick={() => onSave(Number(lat) || 0, Number(lng) || 0)}
        disabled={loading}
        className="w-full h-9 rounded-md text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--color-primary)" }}
      >
        {loading ? "Saving…" : "Update Location"}
      </button>
    </div>
  );
};

/* ── Main page ────────────────────────────────────────────────────── */
const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");

  // modal state
  const [assigning, setAssigning] = useState(null); // volunteer obj
  const [locating, setLocating] = useState(null); // volunteer obj
  const [showAddModal, setShowAddModal] = useState(false);

  // loading flags
  const [formLoading, setFormLoading] = useState(false);
  const [assignLoad, setAssignLoad] = useState(false);
  const [unassignLoad, setUnassignLoad] = useState(null); // volunteer id
  const [locLoad, setLocLoad] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [vRes, zRes] = await Promise.all([getVolunteers(), getZones()]);
      setVolunteers(vRes.data);
      setZones(zRes.data);
    } catch {
      toast.error("Failed to load volunteers.");
    } finally {
      setLoading(false);
    }
  };

  const zoneMap = Object.fromEntries(zones.map((z) => [z.id, z.name]));

  const counts = {
    all: volunteers.length,
    available: volunteers.filter((v) => v.availability === "available").length,
    busy: volunteers.filter((v) => v.availability === "busy").length,
  };

  const filtered = volunteers.filter((v) =>
    filter === "all" ? true : v.availability === filter
  );

  /* ── HANDLERS ── */
  const handleDelete = async (id) => {
    if (!confirm("Remove this volunteer?")) return;
    try {
      await deleteVolunteer(id);
      toast.success("Volunteer removed.");
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Failed to delete volunteer.");
    }
  };

  const handleAssign = async (zoneId) => {
    setAssignLoad(true);
    try {
      await assignVolunteer(assigning.id, zoneId);
      toast.success(`${assigning.name} assigned successfully!`);
      setAssigning(null);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Assignment failed.");
    } finally {
      setAssignLoad(false);
    }
  };

  // ✅ NEW: Unassign volunteer
  const handleUnassign = async (volunteer) => {
    if (!confirm(`Unassign ${volunteer.name} from their current zone?`)) return;
    setUnassignLoad(volunteer.id);
    try {
      await unassignVolunteer(volunteer.id);
      toast.success(`${volunteer.name} unassigned.`);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Unassign failed.");
    } finally {
      setUnassignLoad(null);
    }
  };

  // ✅ NEW: Update location
  const handleUpdateLocation = async (lat, lng) => {
    setLocLoad(true);
    try {
      await updateLocation(locating.id, { lat, lng });
      toast.success(`${locating.name}'s location updated.`);
      setLocating(null);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Location update failed.");
    } finally {
      setLocLoad(false);
    }
  };

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await createVolunteer(data);
      toast.success("Volunteer added!");
      setShowAddModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Failed to add volunteer.");
    } finally {
      setFormLoading(false);
    }
  };

  /* ── Table columns ── */
  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (val) => (
        <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>{val}</span>
      ),
    },
    {
      key: "skills",
      label: "Skills",
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {(val ?? []).slice(0, 3).map((s, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
              style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
            >
              {s}
            </span>
          ))}
          {(val ?? []).length === 0 && (
            <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>—</span>
          )}
        </div>
      ),
    },
    {
      key: "availability",
      label: "Availability",
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "currentZoneId",
      label: "Assigned Zone",
      render: (val) => (
        <span style={{ color: val ? "var(--color-text-primary)" : "var(--color-text-muted)", fontSize: 12 }}>
          {val ? (zoneMap[val] ?? val.slice(0, 8) + "…") : "Unassigned"}
        </span>
      ),
    },
    {
      key: "reliabilityScore",
      label: "Reliability",
      sortable: true,
      render: (val) => (
        <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
          {val != null ? Number(val).toFixed(1) : "—"}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      width: "200px",
      render: (_, row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Assign — always available */}
          <button
            onClick={(e) => { e.stopPropagation(); setAssigning(row); }}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors hover:opacity-80"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
          >
            Assign
          </button>

          {/* Unassign — only when assigned to a zone */}
          {row.currentZoneId && (
            <button
              onClick={(e) => { e.stopPropagation(); handleUnassign(row); }}
              disabled={unassignLoad === row.id}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors hover:opacity-80 disabled:opacity-50 flex items-center gap-1"
              style={{ background: "#fef3c7", color: "#d97706" }}
            >
              <UserX size={10} />
              {unassignLoad === row.id ? "…" : "Unassign"}
            </button>
          )}

          {/* Location */}
          <button
            onClick={(e) => { e.stopPropagation(); setLocating(row); }}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors hover:opacity-80 flex items-center gap-1"
            style={{ background: "#f0fdf4", color: "#16a34a" }}
          >
            <MapPin size={10} />
            Location
          </button>

          {/* Remove */}
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors hover:opacity-80"
            style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Volunteers"
        subtitle={`${volunteers.length} volunteer${volunteers.length !== 1 ? "s" : ""} total`}
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-md text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-primary)" }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Volunteer
          </button>
        }
      />

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <FilterTab label="All" count={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
        <FilterTab label="Available" count={counts.available} active={filter === "available"} onClick={() => setFilter("available")} />
        <FilterTab label="Busy" count={counts.busy} active={filter === "busy"} onClick={() => setFilter("busy")} />
      </div>

      {/* ── Table ── */}
      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={22} color="#94a3b8" />}
          message={filter !== "all" ? `No ${filter} volunteers right now.` : "No volunteers yet. Add your first volunteer."}
          actionLabel={filter === "all" ? "Add Volunteer" : undefined}
          onAction={filter === "all" ? () => setShowAddModal(true) : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          emptyState={<EmptyState icon={<Users size={20} color="#94a3b8" />} message="No volunteers found." />}
        />
      )}

      {/* ── Assign Zone Modal ── */}
      <Modal
        isOpen={!!assigning}
        onClose={() => setAssigning(null)}
        title={`Assign Zone — ${assigning?.name ?? ""}`}
        size="sm"
      >
        <AssignModalContent zones={zones} onAssign={handleAssign} loading={assignLoad} />
      </Modal>

      {/* ── Update Location Modal ── */}
      <Modal
        isOpen={!!locating}
        onClose={() => setLocating(null)}
        title={`Update Location — ${locating?.name ?? ""}`}
        size="sm"
      >
        <LocationModalContent onSave={handleUpdateLocation} loading={locLoad} />
      </Modal>

      {/* ── Add Volunteer Modal ── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Volunteer"
        size="sm"
      >
        <VolunteerForm onSubmit={handleCreate} loading={formLoading} />
      </Modal>
    </div>
  );
};

export default Volunteers;
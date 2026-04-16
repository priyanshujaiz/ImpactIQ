import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Plus, SlidersHorizontal, MapPin } from "lucide-react";

import {
  getZones, createZone, updateZone, deleteZone,
} from "../services/zone.service";

import ZoneCard from "../components/zones/ZoneCard";
import ZoneForm from "../components/zones/ZoneForm";
import Modal from "../components/shared/Modal";
import PageHeader from "../components/shared/PageHeader";
import EmptyState from "../components/shared/EmptyState";

const SORT_OPTIONS = [
  { value: "urgency", label: "Sort by Urgency" },
  { value: "needScore", label: "Sort by Need Score" },
  { value: "name", label: "Sort by Name" },
];

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [selectedZone, setSelectedZone] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("urgency");

  useEffect(() => { fetchZones(); }, []);

  const fetchZones = async () => {
    try {
      const res = await getZones();
      setZones(res.data);
    } catch {
      toast.error("Failed to load zones.");
    } finally {
      setLoading(false);
    }
  };

  // ── CREATE ──
  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await createZone(data);
      toast.success("Zone created!");
      setShowModal(false);
      fetchZones();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Failed to create zone.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── UPDATE ──
  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await updateZone(selectedZone.id, data);
      toast.success("Zone updated!");
      setShowModal(false);
      setSelectedZone(null);
      fetchZones();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Failed to update zone.");
    } finally {
      setFormLoading(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async (id) => {
    if (!confirm("Delete this zone? This cannot be undone.")) return;
    try {
      await deleteZone(id);
      toast.success("Zone deleted.");
      fetchZones();
    } catch {
      toast.error("Failed to delete zone.");
    }
  };

  // ── Filter + Sort ──
  const filtered = zones
    .filter((z) => z.name?.toLowerCase().includes(search.toLowerCase()) || z.zoneId?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return (a.name ?? "").localeCompare(b.name ?? "");
      return (b[sortBy] ?? 0) - (a[sortBy] ?? 0);
    });

  return (
    <div>
      {/* Page header */}
      <PageHeader
        title="Zones"
        subtitle={`${zones.length} zone${zones.length !== 1 ? "s" : ""} total`}
        actions={
          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedZone(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 h-9 px-4 rounded-md text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-primary)" }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Zone
          </button>
        }
      />

      {/* ── Search + Sort bar ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-muted)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search zones…"
            className="w-full pl-8 pr-3 h-9 text-[13px] rounded-md outline-none"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <SlidersHorizontal
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-muted)" }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-8 pr-8 h-9 text-[13px] rounded-md appearance-none cursor-pointer outline-none"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
              color: "var(--color-text-primary)",
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="shimmer rounded-[10px]"
              style={{ height: 200, border: "1px solid var(--color-border)" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<MapPin size={22} color="#94a3b8" />}
          message={search ? `No zones matching "${search}"` : "No zones yet. Add your first zone to get started."}
          actionLabel={!search ? "Add Zone" : undefined}
          onAction={!search ? () => { setIsEditing(false); setSelectedZone(null); setShowModal(true); } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              onEdit={(z) => {
                setSelectedZone(z);
                setIsEditing(true);
                setShowModal(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedZone(null); }}
        title={isEditing ? "Edit Zone" : "Add Zone"}
      >
        <ZoneForm
          onSubmit={isEditing ? handleUpdate : handleCreate}
          initialData={selectedZone}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default Zones;
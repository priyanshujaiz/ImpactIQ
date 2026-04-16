import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Zap, CheckCircle, RefreshCw, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import {
  getCurrentAllocation, runAllocation, applyAllocation,
} from "../services/allocation.service";
import { getZones } from "../services/zone.service";
import { getVolunteers } from "../services/volunteer.service";

import AllocationSummary from "../components/allocation/AllocationSummary";
import AllocationTable from "../components/allocation/AllocationTable";
import AIInsightBox from "../components/allocation/AIInsightBox";
import PageHeader from "../components/shared/PageHeader";

/* ── Action Card ─────────────────────────────────────────── */
const ActionCard = ({ icon: Icon, title, description, lastRun, onClick, loading, color, disabled }) => (
  <div
    className="flex-1 rounded-[14px] p-5 flex flex-col gap-3"
    style={{
      background: "var(--color-card)",
      border: "1px solid var(--color-border)",
      boxShadow: "var(--shadow-card)",
    }}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{ background: color + "22" }}
        >
          <Icon size={18} color={color} />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {title}
          </h3>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            {description}
          </p>
        </div>
      </div>
    </div>

    {/* Last run timestamp */}
    {lastRun && (
      <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
        <Clock size={10} className="inline mr-1" />
        Last run: {(() => { try { return formatDistanceToNow(new Date(lastRun), { addSuffix: true }); } catch { return lastRun; } })()}
      </p>
    )}

    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="mt-auto h-9 rounded-md text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
      style={{ background: color }}
    >
      {loading
        ? <><RefreshCw size={13} className="animate-spin" /> Running…</>
        : <><Icon size={13} /> {title}</>
      }
    </button>
  </div>
);

/* ── Main page ───────────────────────────────────────────── */
const Allocation = () => {
  const [allocation, setAllocation] = useState(null);
  const [zones, setZones] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [allocRes, zoneRes, volRes] = await Promise.all([
        getCurrentAllocation(),
        getZones(),
        getVolunteers(),
      ]);
      setAllocation(allocRes.data);
      setZones(zoneRes.data);
      setVolunteers(volRes.data);
    } catch {
      toast.error("Failed to load allocation data.");
    } finally {
      setPageLoading(false);
    }
  };

  // ── Run allocation ──
  const handleRun = async () => {
    setRunning(true);
    const toastId = toast.loading("Running AI allocation engine…");
    try {
      const res = await runAllocation();
      // Backend returns { message, allocation }
      setAllocation(res.data.allocation ?? res.data);
      toast.success("Allocation generated!", { id: toastId });
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Allocation failed.", { id: toastId });
    } finally {
      setRunning(false);
    }
  };

  // ── Apply allocation ──
  const handleApply = async () => {
    if (!allocation?.id) return;
    setApplying(true);
    const toastId = toast.loading("Applying allocation to database…");
    try {
      await applyAllocation(allocation.id);
      toast.success("Allocation applied successfully!", { id: toastId });
      fetchAll(); // refresh
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Apply failed.", { id: toastId });
    } finally {
      setApplying(false);
    }
  };

  // ── Loading skeleton ──
  if (pageLoading) {
    return (
      <div className="space-y-5">
        <div className="flex gap-4">
          <div className="shimmer flex-1 rounded-[14px]" style={{ height: 140 }} />
          <div className="shimmer flex-1 rounded-[14px]" style={{ height: 140 }} />
        </div>
        <div className="shimmer rounded-[14px]" style={{ height: 72 }} />
        <div className="shimmer rounded-[14px]" style={{ height: 300 }} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Allocation"
        subtitle={
          allocation
            ? `Current plan · ${allocation.allocationPlan?.length ?? 0} assignments`
            : "No allocation generated yet"
        }
      />

      {/* ── Action cards ── */}
      <div className="flex gap-4 flex-wrap">
        <ActionCard
          icon={Zap}
          title="Run Allocation"
          description="Optimize volunteer placement using the AI engine"
          lastRun={allocation?.createdAt}
          onClick={handleRun}
          loading={running}
          color="#6366f1"
        />
        <ActionCard
          icon={CheckCircle}
          title="Apply Allocation"
          description="Push current assignments to the live database"
          lastRun={allocation?.createdAt}
          onClick={handleApply}
          loading={applying}
          disabled={!allocation}
          color="#2563eb"
        />
      </div>

      {/* ── Summary strip ── */}
      {allocation && <AllocationSummary allocation={allocation} />}

      {/* ── Assignment table ── */}
      <div>
        <h2
          className="text-[13px] font-semibold mb-3 uppercase tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          Assignments
        </h2>
        <AllocationTable
          allocation={allocation}
          zones={zones}
          volunteers={volunteers}
        />
      </div>

      {/* ── AI Insight ── */}
      <AIInsightBox allocation={allocation} isLoading={running} />
    </div>
  );
};

export default Allocation;
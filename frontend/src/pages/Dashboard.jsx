import { useEffect, useState } from "react";
import {
  getSummary, getHistory, getZoneMetrics,
  getActiveAlerts, getCurrentAllocation,
} from "../services/metrics.service";
import { getZones } from "../services/zone.service";
import { getVolunteers } from "../services/volunteer.service";

import { MapPin, Users, AlertTriangle, Zap, Activity } from "lucide-react";

import SummaryCard from "../components/dashboard/SummaryCard";
import ImpactChart from "../components/dashboard/ImpactChart";
import AlertsList from "../components/dashboard/AlertsList";
import ZonesPreview from "../components/dashboard/ZonesPreview";
import AllocationPreview from "../components/dashboard/AllocationPreview";
import AIInsightBox from "../components/dashboard/AIInsightBox";
import PageHeader from "../components/shared/PageHeader";
import { format } from "date-fns";

const Dashboard = () => {
  const [data, setData] = useState({
    summary: null,
    history: [],
    zones: [],
    alerts: [],
    allocation: null,
    // Lookup maps for AllocationPreview names
    zoneMap: {},
    volMap: {},
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [summary, history, zones, alerts, allocation, fullZones, volunteers] = await Promise.all([
        getSummary(),
        getHistory(),
        getZoneMetrics(),
        getActiveAlerts(),
        getCurrentAllocation(),
        getZones(),       // full zones for name lookups (id→name)
        getVolunteers(),  // volunteers for name lookups (id→name)
      ]);

      // Build name lookup maps
      const zoneMap = Object.fromEntries((fullZones.data ?? []).map((z) => [z.id, z.name ?? z.zoneId]));
      const volMap = Object.fromEntries((volunteers.data ?? []).map((v) => [v.id, v.name]));

      setData({
        summary: summary.data,
        history: history.data,
        zones: zones.data,
        alerts: alerts.data,
        allocation: allocation.data,
        zoneMap,
        volMap,
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-5">
        {/* Metric cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="shimmer rounded-[14px]"
              style={{ height: 110, border: "1px solid var(--color-border)" }}
            />
          ))}
        </div>
        {/* Chart row skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="shimmer rounded-[14px] lg:col-span-3" style={{ height: 280 }} />
          <div className="shimmer rounded-[14px] lg:col-span-2" style={{ height: 280 }} />
        </div>
      </div>
    );
  }

  const s = data.summary ?? {};

  // Metric cards config — using verified field names from getSummary()
  const metricCards = [
    {
      title: "Zones",
      value: s.totalZones ?? 0,
      icon: <MapPin size={15} color="#2563eb" />,
      trend: null,
      trendDir: "neutral",
      danger: false,
    },
    {
      title: "Volunteers",
      value: s.totalVolunteers ?? 0,
      icon: <Users size={15} color="#0ea5e9" />,
      trend: null,
      trendDir: "neutral",
      danger: false,
    },
    {
      title: "Alerts",
      value: s.activeAlerts ?? 0,
      icon: <AlertTriangle size={15} color="#dc2626" />,
      trend: s.activeAlerts > 0 ? "Requires attention" : "All clear",
      trendDir: s.activeAlerts > 0 ? "down" : "neutral",
      danger: (s.activeAlerts ?? 0) > 0,
    },
    {
      title: "Impact Score",
      value: s.totalImpact != null ? Number(s.totalImpact).toFixed(1) : "—",
      icon: <Zap size={15} color="#7c3aed" />,
      trend: null,
      trendDir: "neutral",
      danger: false,
    },
    {
      title: "Efficiency",
      value: s.allocationEfficiency != null ? `${Number(s.allocationEfficiency).toFixed(1)}%` : "—",
      icon: <Activity size={15} color="#16a34a" />,
      trend: null,
      trendDir: "neutral",
      danger: false,
    },
  ];

  const today = format(new Date(), "dd MMM yyyy");

  return (
    <div className="space-y-5">
      {/* Page header */}
      <PageHeader
        title="Dashboard"
        subtitle={`Overview · ${today}`}
      />

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricCards.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            trend={card.trend}
            trendDir={card.trendDir}
            icon={card.icon}
            danger={card.danger}
          />
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Impact Line Chart (60%) */}
        <div className="lg:col-span-3">
          <ImpactChart data={data.history} />
        </div>
        {/* AI Insight (40%) */}
        <div className="lg:col-span-2">
          <AIInsightBox allocation={data.allocation} compact={true} />
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AlertsList alerts={data.alerts} />
        <ZonesPreview zones={data.zones} />
        <AllocationPreview
          allocation={data.allocation}
          zoneMap={data.zoneMap}
          volMap={data.volMap}
        />
      </div>
    </div>
  );
};

export default Dashboard;
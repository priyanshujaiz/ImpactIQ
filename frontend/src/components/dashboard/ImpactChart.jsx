import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from "recharts";
import { format } from "date-fns";

/* Custom tooltip */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-[8px] text-[12px]"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-modal)",
      }}
    >
      <p style={{ color: "var(--color-text-muted)" }}>
        {label ? (() => { try { return format(new Date(label), "dd MMM, HH:mm"); } catch { return label; } })() : ""}
      </p>
      <p style={{ color: "var(--color-primary)", fontWeight: 600 }}>
        Impact: {payload[0].value?.toFixed(2)}
      </p>
    </div>
  );
};

/**
 * ImpactChart
 * @param {Array<{timestamp: string|Date, impact: number}>} data
 */
const ImpactChart = ({ data = [] }) => {
  // Format x-axis labels
  const formatted = data.map((d) => ({
    ...d,
    label: (() => { try { return format(new Date(d.timestamp), "dd MMM"); } catch { return d.timestamp; } })(),
  }));

  const latest = data[data.length - 1]?.impact ?? 0;
  const first = data[0]?.impact ?? 0;
  const pct = first === 0 ? 0 : (((latest - first) / first) * 100).toFixed(1);
  const up = latest >= first;

  return (
    <div
      className="rounded-[14px] p-5"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Total Impact Score
          </p>
          <p className="text-[28px] font-bold leading-tight mt-0.5" style={{ color: "var(--color-text-primary)" }}>
            {latest.toFixed(1)}
          </p>
        </div>
        {data.length > 1 && (
          <span
            className="text-[12px] font-semibold mb-1 px-2 py-0.5 rounded-full"
            style={{
              color: up ? "var(--color-success)" : "var(--color-danger)",
              background: up ? "var(--color-success-bg)" : "var(--color-danger-bg)",
            }}
          >
            {up ? "↑" : "↓"} {Math.abs(pct)}% vs first
          </span>
        )}
      </div>
      <p className="text-[12px] mb-4" style={{ color: "var(--color-text-muted)" }}>Impact over time</p>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[200px]" style={{ color: "var(--color-text-muted)" }}>
          No history yet — run your first allocation.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="impact"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#impactGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ImpactChart;
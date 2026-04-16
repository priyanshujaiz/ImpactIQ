/**
 * ExtractedDataView
 * Renders extractedData as clean label:value pairs — not raw JSON.
 * Fields: { zone_id, urgency, people_affected, severity, need_type[] }
 * All fields are optional — never crashes on null/missing values.
 */
const Row = ({ label, value }) => {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span
        className="text-[11px] font-semibold uppercase tracking-wider w-24 shrink-0 pt-0.5"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      <span className="text-[12px] font-medium" style={{ color: "var(--color-text-primary)" }}>
        {Array.isArray(value)
          ? value.join(", ")
          : String(value)}
      </span>
    </div>
  );
};

const ExtractedDataView = ({ data }) => {
  if (!data) return (
    <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
      No extracted data available.
    </p>
  );

  return (
    <div
      className="rounded-md p-3 divide-y mt-3"
      style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-border)",
        divideColor: "var(--color-border)",
      }}
    >
      <Row label="Zone" value={data.zone_id} />
      <Row label="Urgency" value={data.urgency} />
      <Row label="People" value={data.people_affected} />
      <Row label="Severity" value={data.severity} />
      <Row label="Needs" value={data.need_type} />
      {data.gemini_confidence != null && (
        <Row label="Confidence" value={`${(data.gemini_confidence * 100).toFixed(0)}%`} />
      )}
    </div>
  );
};

export default ExtractedDataView;
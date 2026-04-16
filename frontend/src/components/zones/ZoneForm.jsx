import { useState, useEffect } from "react";

/* Reusable styled input */
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  height: 36,
  padding: "0 10px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border)",
  fontSize: 13,
  color: "var(--color-text-primary)",
  background: "var(--color-card)",
  outline: "none",
  width: "100%",
};

/**
 * ZoneForm
 * Preserves the exact same payload shape and submit logic as before.
 * Fields: zoneId(create only), name, lat, lng, urgency, peopleAffected, severity, needType (comma-sep string)
 */
const ZoneForm = ({ onSubmit, initialData, loading = false }) => {
  const [form, setForm] = useState({
    zoneId: "",
    name: "",
    lat: "",
    lng: "",
    urgency: 1,
    peopleAffected: 0,
    severity: 1,
    needType: "",
  });

  // Prefill in edit mode
  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        needType: initialData.needType?.join(",") || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedNeedType = form.needType
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      lat: Number(form.lat) || 0,
      lng: Number(form.lng) || 0,
      urgency: Number(form.urgency) || 1,
      peopleAffected: Number(form.peopleAffected) || 0,
      severity: Number(form.severity) || 1,
      // BUG D FIX: use null instead of [] when no need types entered
      needType: parsedNeedType.length ? parsedNeedType : null,
    };
    if (!initialData) payload.zoneId = form.zoneId;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Row 1 — Zone ID + Name */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Zone ID">
          <input
            name="zoneId"
            value={form.zoneId}
            onChange={handleChange}
            placeholder="e.g. ZONE-A1"
            disabled={!!initialData}
            style={{ ...inputStyle, opacity: initialData ? 0.5 : 1 }}
          />
        </Field>
        <Field label="Name">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Zone Alpha"
            required
            style={inputStyle}
          />
        </Field>
      </div>

      {/* Row 2 — Lat + Lng */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude">
          <input
            name="lat"
            type="number"
            step="any"
            value={form.lat}
            onChange={handleChange}
            placeholder="22.31"
            style={inputStyle}
          />
        </Field>
        <Field label="Longitude">
          <input
            name="lng"
            type="number"
            step="any"
            value={form.lng}
            onChange={handleChange}
            placeholder="87.32"
            style={inputStyle}
          />
        </Field>
      </div>

      {/* Row 3 — Urgency + Severity */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Urgency (1–10)">
          <input
            name="urgency"
            type="number"
            min={1}
            max={10}
            value={form.urgency}
            onChange={handleChange}
            style={inputStyle}
          />
        </Field>
        <Field label="Severity (1–10)">
          <input
            name="severity"
            type="number"
            min={1}
            max={10}
            value={form.severity}
            onChange={handleChange}
            style={inputStyle}
          />
        </Field>
      </div>

      {/* Row 4 — People affected */}
      <Field label="People Affected">
        <input
          name="peopleAffected"
          type="number"
          min={0}
          value={form.peopleAffected}
          onChange={handleChange}
          style={inputStyle}
        />
      </Field>

      {/* Row 5 — Need Types */}
      <Field label="Need Types (comma-separated)">
        <input
          name="needType"
          value={form.needType}
          onChange={handleChange}
          placeholder="food, medical, shelter"
          style={inputStyle}
        />
      </Field>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-9 rounded-md text-[13px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
        style={{ background: "var(--color-primary)", marginTop: 4 }}
      >
        {loading ? "Saving…" : initialData ? "Update Zone" : "Create Zone"}
      </button>
    </form>
  );
};

export default ZoneForm;
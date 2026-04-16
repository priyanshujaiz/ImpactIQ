import { useState } from "react";

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

const Field = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <label
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </label>
      {hint && (
        <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
          {hint}
        </span>
      )}
    </div>
    {children}
  </div>
);

/**
 * VolunteerForm
 * Backend schema: { name, skills[], lat, lng, availability }
 * skills is sent as an array — entered as comma-separated text
 */
const VolunteerForm = ({ onSubmit, loading = false }) => {
  const [form, setForm] = useState({
    name: "",
    skills: "",          // comma-separated → converted to array on submit
    lat: "",
    lng: "",
    availability: "available",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert comma-separated skills string → trimmed string array
    const skillsArray = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({
      name: form.name,
      skills: skillsArray,                  // ← schema: text[].array()
      lat: Number(form.lat) || 0,
      lng: Number(form.lng) || 0,
      availability: form.availability,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Name */}
      <Field label="Full Name">
        <input
          placeholder="e.g. Rahul Sharma"
          value={form.name}
          onChange={set("name")}
          required
          style={inputStyle}
        />
      </Field>

      {/* Skills — BUG A FIX: missing from original form */}
      <Field label="Skills" hint="comma-separated">
        <input
          placeholder="e.g. first-aid, logistics, search-rescue"
          value={form.skills}
          onChange={set("skills")}
          style={inputStyle}
        />
      </Field>

      {/* Lat + Lng */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude">
          <input
            type="number"
            step="any"
            placeholder="22.31"
            value={form.lat}
            onChange={set("lat")}
            style={inputStyle}
          />
        </Field>
        <Field label="Longitude">
          <input
            type="number"
            step="any"
            placeholder="87.32"
            value={form.lng}
            onChange={set("lng")}
            style={inputStyle}
          />
        </Field>
      </div>

      {/* Availability */}
      <Field label="Availability">
        <select
          value={form.availability}
          onChange={set("availability")}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="offline">Offline</option>
        </select>
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-9 rounded-md text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--color-primary)", marginTop: 4 }}
      >
        {loading ? "Adding…" : "Add Volunteer"}
      </button>
    </form>
  );
};

export default VolunteerForm;
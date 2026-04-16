import { useState } from "react";
import { Loader2, Send } from "lucide-react";

/**
 * ReportForm
 * Payload: { rawText: string } — unchanged from before
 */
const PLACEHOLDER = `Example: "Zone Alpha-7 has critical flood conditions. Approximately 200 people need immediate medical aid and food supplies. Urgency level is 9/10."`;

const ReportForm = ({ onSubmit, loading }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div
      className="rounded-[14px] p-6 flex flex-col gap-4 h-full"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div>
        <h2 className="text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Ingest Field Report
        </h2>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Gemini AI will extract zone, urgency, and need data automatically.
        </p>
      </div>

      {/* Textarea */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={PLACEHOLDER}
          className="flex-1 w-full resize-none rounded-md p-3 text-[13px] leading-relaxed outline-none transition-shadow"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-card-bg)",
            color: "var(--color-text-primary)",
            minHeight: 160,
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />

        {/* Character count */}
        <p className="text-[11px] text-right" style={{ color: "var(--color-text-muted)" }}>
          {text.length} characters
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full h-10 rounded-md text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--color-primary)" }}
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
            : <><Send size={13} /> Submit Report</>
          }
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
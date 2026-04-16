import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import StatusBadge from "../shared/StatusBadge";
import ExtractedDataView from "./ExtractedDataView";

/**
 * ReportCard
 * Props: report, onDelete(id)
 */
const ReportCard = ({ report, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const preview = report.rawText?.slice(0, 120);
  const hasMore = report.rawText?.length > 120;

  const createdAt = report.createdAt
    ? (() => { try { return format(new Date(report.createdAt), "dd MMM yyyy, HH:mm"); } catch { return ""; } })()
    : "";

  const confidence = report.geminiConfidence != null
    ? `${(Number(report.geminiConfidence) * 100).toFixed(0)}%`
    : null;

  return (
    <div
      className="rounded-[10px] overflow-hidden transition-shadow hover:shadow-md"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* ── Header row ── */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--color-card-bg)" }}
      >
        {/* Left: icon + timestamp */}
        <div className="flex items-center gap-2">
          <FileText size={13} style={{ color: "var(--color-text-muted)" }} />
          <span className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
            {createdAt}
          </span>
        </div>

        {/* Right: confidence + status + delete */}
        <div className="flex items-center gap-2">
          {confidence && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "var(--color-card)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}
            >
              AI {confidence}
            </span>
          )}
          <StatusBadge status={report.status ?? "pending"} />
          {onDelete && (
            <button
              onClick={() => {
                if (confirm("Delete this report? This cannot be undone.")) {
                  onDelete(report.id);
                }
              }}
              title="Delete report"
              className="w-6 h-6 rounded flex items-center justify-center transition-colors hover:bg-[#fee2e2]"
            >
              <Trash2 size={12} color="#dc2626" />
            </button>
          )}
        </div>
      </div>

      {/* ── Raw text preview ── */}
      <div className="px-4 py-3">
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {expanded || !hasMore ? report.rawText : `${preview}…`}
        </p>
      </div>

      {/* ── Expand / collapse extracted data ── */}
      <div className="px-4 pb-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors hover:opacity-70"
          style={{ color: "var(--color-primary)" }}
        >
          {expanded
            ? <><ChevronUp size={12} /> Hide extracted data</>
            : <><ChevronDown size={12} /> Show extracted data</>
          }
        </button>

        {expanded && (
          <div className="mt-2">
            <ExtractedDataView data={report.extractedData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";

import { ingestReport, getReports, deleteReport } from "../services/report.service";

import ReportForm from "../components/reports/ReportForm";
import ReportCard from "../components/reports/ReportCard";
import PageHeader from "../components/shared/PageHeader";
import EmptyState from "../components/shared/EmptyState";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await getReports();
      // Sort newest first
      const sorted = [...(res.data ?? [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setReports(sorted);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setListLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReport(id);
      toast.success("Report deleted.");
      fetchReports();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Failed to delete report.");
    }
  };

  const handleSubmit = async (text) => {
    setLoading(true);
    const toastId = toast.loading("Processing report with Gemini AI…");
    try {
      await ingestReport(text);
      toast.success("Report ingested and processed!", { id: toastId });
      fetchReports();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Ingest failed.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Field Reports"
        subtitle={`${reports.length} report${reports.length !== 1 ? "s" : ""} ingested`}
      />

      {/* ── Split layout: form left (40%) · history right (60%) ── */}
      <div className="flex gap-5 items-start flex-col lg:flex-row">

        {/* ── Left: Ingest form ── */}
        <div className="w-full lg:w-[40%] shrink-0">
          <ReportForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* ── Right: Report history ── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* History header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Report History
            </h2>
            {reports.length > 0 && (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
              >
                {reports.length} total
              </span>
            )}
          </div>

          {/* List */}
          {listLoading ? (
            // Skeleton cards
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="shimmer rounded-[10px]"
                style={{ height: 110, border: "1px solid var(--color-border)" }}
              />
            ))
          ) : reports.length === 0 ? (
            <div
              className="rounded-[14px] py-12"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <EmptyState
                icon={<FileText size={22} color="#94a3b8" />}
                message="No reports yet. Submit a field report on the left to get started."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {reports.map((r) => (
                <ReportCard key={r.id} report={r} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
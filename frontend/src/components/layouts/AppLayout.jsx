import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getActiveAlerts } from "../../services/metrics.service";

const AppLayout = ({ children }) => {
  const [alertCount, setAlertCount] = useState(0);

  // Poll alert count for sidebar + topbar badge
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await getActiveAlerts();
        setAlertCount(Array.isArray(res.data) ? res.data.length : 0);
      } catch {
        // silently fail — non-critical
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-canvas)" }}>

      {/* ── Fixed Sidebar ── */}
      <Sidebar alertCount={alertCount} />

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Fixed Topbar ── */}
        <Topbar alertCount={alertCount} />

        {/* ── Scrollable content canvas ── */}
        <main
          className="flex-1 overflow-y-auto px-7 py-6"
          style={{ background: "var(--color-canvas)" }}
        >
          {children}
        </main>
      </div>

      {/* ── Toast notifications ── */}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-modal)",
            border: "1px solid var(--color-border)",
          },
          success: {
            iconTheme: { primary: "var(--color-success)", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "var(--color-danger)", secondary: "#fff" },
          },
        }}
      />
    </div>
  );
};

export default AppLayout;
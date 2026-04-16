import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, ChevronDown, LogOut, User } from "lucide-react";

// Map pathname → friendly page name
const pageTitles = {
  "/dashboard": "Dashboard",
  "/zones": "Zones",
  "/volunteers": "Volunteers",
  "/allocation": "Allocation",
  "/reports": "Reports",
};

const Topbar = ({ alertCount = 0 }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pageTitle = pageTitles[pathname] || "ImpactIQ";

  return (
    <header
      className="h-14 shrink-0 flex items-center justify-between px-6 gap-4"
      style={{
        background: "var(--color-card)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* ── Page title ── */}
      <h1 className="text-[15px] font-semibold text-[#0f172a] shrink-0">
        {pageTitle}
      </h1>

      {/* ── Search bar ── */}
      <div className="flex-1 max-w-sm relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search anything…"
          className="w-full pl-8 pr-12 py-1.5 text-[13px] rounded-md border-0 outline-none"
          style={{
            background: "var(--color-card-bg)",
            color: "var(--color-text-primary)",
          }}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium px-1 rounded"
          style={{ color: "#94a3b8", background: "#e2e8f0" }}
        >
          ⌘K
        </span>
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Bell */}
        <button
          className="relative p-1.5 rounded-md hover:bg-[#f1f5f9] transition-colors"
          title="Alerts"
          onClick={() => navigate("/dashboard")}
        >
          <Bell size={16} color="#64748b" />
          {alertCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: "var(--color-danger)" }}
            >
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: "var(--color-border)" }} />

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-[#f1f5f9] transition-colors"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "var(--color-primary)" }}
            >
              {(user.name?.[0] || "A").toUpperCase()}
            </div>
            <span className="text-[13px] font-medium text-[#374151] hidden sm:block">
              {user.name || "Admin"}
            </span>
            <ChevronDown size={13} color="#94a3b8" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-44 rounded-md py-1 z-50"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-modal)",
              }}
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-[12px] font-semibold text-[#0f172a]">{user.name || "Admin"}</p>
                <p className="text-[11px] text-[#64748b]">{user.role || "operator"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#dc2626] hover:bg-[#fee2e2] transition-colors"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
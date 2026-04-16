import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Users,
  Zap,
  FileText,
  AlertTriangle,
  LogOut,
  Bolt,
  FlaskConical,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Zones", path: "/zones", icon: MapPin },
  { name: "Volunteers", path: "/volunteers", icon: Users },
  { name: "Allocation", path: "/allocation", icon: Zap },
  { name: "Simulation", path: "/simulation", icon: FlaskConical },
  { name: "Reports", path: "/reports", icon: FileText },
];

const Sidebar = ({ alertCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  })();

  return (
    <aside
      className="flex flex-col h-screen w-[220px] shrink-0 sticky top-0"
      style={{ background: "var(--color-sidebar)" }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2 px-5 pt-6 pb-5">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "var(--color-primary)" }}
        >
          <Bolt size={15} color="#fff" strokeWidth={2.5} />
        </div>
        <span
          className="text-base font-bold tracking-tight"
          style={{ color: "#7dd3fc" }}
        >
          ImpactIQ
        </span>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-150 group",
                isActive
                  ? "text-[#bfdbfe]"
                  : "text-[#64748b] hover:text-[#94a3b8]"
              )
            }
            style={({ isActive }) =>
              isActive ? { background: "#1e40af" } : {}
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className="shrink-0 transition-colors"
                  color={isActive ? "#60a5fa" : "#475569"}
                />
                {name}
              </>
            )}
          </NavLink>
        ))}

        {/* ── Alert Badge ── */}
        {alertCount > 0 && (
          <div className="mt-3 mx-1 flex items-center gap-2 px-3 py-2 rounded-md bg-[#450a0a]">
            <div className="relative shrink-0">
              <AlertTriangle size={15} color="#f87171" />
              <span
                className="pulse-dot absolute -top-1 -right-1 w-2 h-2 rounded-full"
                style={{ background: "#dc2626" }}
              />
            </div>
            <span className="text-[13px] text-[#fca5a5] font-medium">
              {alertCount} Alert{alertCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </nav>

      {/* ── User footer ── */}
      <div
        className="px-4 py-4 border-t flex items-center gap-3"
        style={{ borderColor: "#1e293b" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: "var(--color-primary)" }}
        >
          {(user.name?.[0] || "A").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#cbd5e1] truncate">
            {user.name || "Admin"}
          </p>
          <p className="text-[11px] text-[#475569] truncate">
            {user.role || "operator"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="text-[#475569] hover:text-[#f87171] transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
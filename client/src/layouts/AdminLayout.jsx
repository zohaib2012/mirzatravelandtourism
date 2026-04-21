import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaBars, FaTimes, FaTachometerAlt, FaUsers, FaPlane, FaBookOpen,
  FaKaaba, FaHotel, FaPassport, FaBus, FaMoneyBillWave, FaUniversity,
  FaCog, FaSignOutAlt, FaChevronDown, FaHome, FaChartBar, FaBuilding,
  FaCertificate, FaTags, FaShieldAlt,
} from "react-icons/fa";

const SIDEBAR_W = 270;

const menuGroups = [
  {
    groupLabel: "Overview",
    items: [
      { to: "/admin", icon: FaTachometerAlt, label: "Dashboard", end: true },
      { to: "/admin/reports", icon: FaChartBar, label: "Reports" },
    ],
  },
  {
    groupLabel: "Management",
    items: [
      { to: "/admin/agents", icon: FaUsers, label: "Agents" },
      { to: "/admin/bookings", icon: FaBookOpen, label: "All Bookings" },
      {
        label: "Flight Management", icon: FaPlane, children: [
          { to: "/admin/airlines", label: "Airlines" },
          { to: "/admin/sectors", label: "Sectors / Routes" },
          { to: "/admin/groups", label: "Flight Groups" },
        ],
      },
      {
        label: "Umrah", icon: FaKaaba, children: [
          { to: "/admin/packages", label: "Umrah Packages" },
          { to: "/admin/hotels", label: "Hotels" },
          { to: "/admin/visa-types", label: "Visa Types" },
          { to: "/admin/transport", label: "Transport" },
        ],
      },
    ],
  },
  {
    groupLabel: "Finance",
    items: [
      {
        label: "Accounts", icon: FaMoneyBillWave, children: [
          { to: "/admin/payments", label: "Payment Verification" },
          { to: "/admin/bank-accounts", label: "Bank Accounts" },
          { to: "/admin/ledger", label: "Agent Ledgers" },
        ],
      },
    ],
  },
  {
    groupLabel: "Website",
    items: [
      {
        label: "Content", icon: FaBuilding, children: [
          { to: "/admin/branches", label: "Office Branches" },
          { to: "/admin/authorizations", label: "Authorizations" },
          { to: "/admin/deals", label: "Deals & Offers" },
        ],
      },
      { to: "/admin/settings", icon: FaCog, label: "Settings" },
      { to: "/admin/update-password", icon: FaShieldAlt, label: "Saved" },
    ],
  },
];

const SidebarLink = ({ to, icon: Icon, label, end, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
        isActive
          ? "bg-gradient-to-r from-accent to-accent/90 text-primary shadow-lg shadow-accent/30 font-bold"
          : "text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-0.5"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon className={`text-base shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : ""}`} />
        <span className="truncate">{label}</span>
        {isActive && (
          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        )}
      </>
    )}
  </NavLink>
);

const ExpandableMenu = ({ item, expanded, onToggle, onNavigate }) => (
  <div>
    <button
      onClick={() => onToggle(item.label)}
      className="w-full flex items-center justify-between mx-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
      style={{ width: `calc(100% - 16px)` }}
    >
      <span className="flex items-center gap-3">
        <item.icon className="text-base shrink-0 transition-transform group-hover:scale-110" />
        {item.label}
      </span>
      <FaChevronDown className={`text-xs transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
    </button>
    {expanded && (
      <div className="ml-9 mr-2 mt-1 space-y-0.5 border-l-2 border-accent/30 pl-3 animate-slideDown">
        {item.children.map((child) => (
          <NavLink
            key={child.to}
            to={child.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block py-2 px-2 text-sm rounded-lg transition-all duration-200 ${
                isActive 
                  ? "text-accent font-semibold bg-accent/10" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <span className="flex items-center gap-2">
                <span className={`w-1 h-1 rounded-full ${isActive ? "bg-accent" : "bg-white/30"}`} />
                {child.label}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    )}
  </div>
);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const overlayRef = useRef();

  useEffect(() => setMobileSidebarOpen(false), [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (mobileSidebarOpen && overlayRef.current === e.target)
        setMobileSidebarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileSidebarOpen]);

  const toggleMenu = (label) =>
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const SidebarContent = ({ onNavigate }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-50" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center shadow-lg shadow-accent/30 shrink-0">
            <FaShieldAlt className="text-primary text-xl" />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-bold text-white truncate">Mirza Travel</p>
            <p className="text-xs text-white/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {menuGroups.map((group) => (
          <div key={group.groupLabel} className="mb-3">
            <p className="px-5 pt-3 pb-2 text-[10px] font-bold text-white/25 uppercase tracking-widest">
              {group.groupLabel}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) =>
                item.children ? (
                  <ExpandableMenu
                    key={item.label}
                    item={item}
                    expanded={!!expandedMenus[item.label]}
                    onToggle={toggleMenu}
                    onNavigate={onNavigate}
                  />
                ) : (
                  <SidebarLink key={item.to} {...item} onClick={onNavigate} />
                )
              )}
            </div>
          </div>
        ))}

        <div className="mt-4 pt-3 border-t border-white/10">
          <NavLink to="/" onClick={onNavigate}
            className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:bg-white/10 hover:text-white transition-all hover:translate-x-0.5">
            <FaHome className="text-base" /> 
            <span>Main Website</span>
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2 mb-2 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-deepblue rounded-full flex items-center justify-center text-accent text-sm font-bold shadow border-2 border-accent/30">
            A
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white/80 truncate">Administrator</p>
            <p className="text-[10px] text-white/40">admin@mirzatravel.pk</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all group">
          <FaSignOutAlt className="text-base group-hover:translate-x-1 transition-transform" /> 
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col text-white transition-all duration-300 shrink-0 overflow-hidden"
        style={{
          width: sidebarOpen ? `${SIDEBAR_W}px` : 0,
          background: "linear-gradient(180deg, #030f1a 0%, #0C446F 100%)",
        }}
      >
        <SidebarContent onNavigate={null} />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileSidebarOpen && (
        <div
          ref={overlayRef}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        >
          <aside
            className="absolute left-0 top-0 bottom-0 flex flex-col shadow-2xl overflow-hidden"
            style={{
              width: `${SIDEBAR_W}px`,
              background: "linear-gradient(180deg, #030f1a 0%, #0C446F 100%)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <span className="text-white font-bold text-sm">Admin Menu</span>
              <button onClick={() => setMobileSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SidebarContent onNavigate={() => setMobileSidebarOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-gray-50">

        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 px-4 py-0 flex items-center justify-between h-16 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl text-gray-500 hover:text-primary hover:bg-primary/5 transition-all">
              <FaBars className="text-lg" />
            </button>
            <button onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden flex w-10 h-10 items-center justify-center rounded-xl text-gray-500 hover:text-primary hover:bg-primary/5 transition-all">
              <FaBars className="text-lg" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <span className="text-gray-400 text-xs">Mirza Travel</span>
              <span className="text-gray-300 text-xs">›</span>
              <span className="text-primary font-semibold text-xs">Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-deepblue rounded-full flex items-center justify-center text-accent text-xs font-bold shadow border-2 border-accent/20">
                A
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-gray-800">Administrator</p>
                <p className="text-[10px] text-gray-400">Full Access</p>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 text-xs font-semibold transition-all hover:shadow-sm">
              <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5 lg:p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

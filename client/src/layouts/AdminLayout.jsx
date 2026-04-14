import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaBars, FaTimes, FaTachometerAlt, FaUsers, FaPlane, FaBookOpen,
  FaKaaba, FaHotel, FaPassport, FaBus, FaMoneyBillWave, FaUniversity,
  FaCog, FaSignOutAlt, FaChevronDown, FaHome, FaChartBar, FaBuilding,
  FaCertificate, FaTags, FaShieldAlt,
} from "react-icons/fa";

const SIDEBAR_W = 260;

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
    ],
  },
];

const SidebarLink = ({ to, icon: Icon, label, end, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-accent text-primary shadow-sm font-bold"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`
    }
  >
    <Icon className="text-base shrink-0" />
    <span className="truncate">{label}</span>
  </NavLink>
);

const ExpandableMenu = ({ item, expanded, onToggle, onNavigate }) => (
  <div>
    <button
      onClick={() => onToggle(item.label)}
      className="w-full flex items-center justify-between mx-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
      style={{ width: `calc(100% - 16px)` }}
    >
      <span className="flex items-center gap-3">
        <item.icon className="text-base shrink-0" />
        {item.label}
      </span>
      <FaChevronDown className={`text-xs transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
    </button>
    {expanded && (
      <div className="ml-9 mr-2 mt-1 space-y-0.5 border-l-2 border-white/10 pl-3">
        {item.children.map((child) => (
          <NavLink
            key={child.to}
            to={child.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block py-2 px-2 text-sm rounded-lg transition-all ${
                isActive ? "text-accent font-semibold" : "text-white/50 hover:text-white"
              }`
            }
          >
            {child.label}
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
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-md shrink-0">
            <FaShieldAlt className="text-primary text-lg" />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-bold text-white">Mirza Travel</p>
            <p className="text-xs text-white/40">Admin Control Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {menuGroups.map((group) => (
          <div key={group.groupLabel} className="mb-2">
            <p className="px-5 pt-3 pb-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
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

        <div className="mt-2 pt-2 border-t border-white/10">
          <NavLink to="/" onClick={onNavigate}
            className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:bg-white/10 hover:text-white transition-all">
            <FaHome className="text-base" /> Main Website
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-semibold text-white/60 truncate">admin@mirzatravel.pk</p>
          <p className="text-[10px] text-white/30">Administrator</p>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
          <FaSignOutAlt className="text-base" /> Logout
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="bg-white shadow-sm border-b border-gray-100 px-4 py-0 flex items-center justify-between h-14 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-all">
              <FaBars className="text-base" />
            </button>
            <button onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden flex w-9 h-9 items-center justify-center rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-all">
              <FaBars className="text-base" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-gray-400 text-xs">Mirza Travel</span>
              <span className="text-gray-300 text-xs">/</span>
              <span className="text-primary font-semibold text-xs">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#030f1a] to-primary rounded-full flex items-center justify-center text-accent text-sm font-bold shadow border border-primary/30">
                A
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-gray-800">Administrator</p>
                <p className="text-[10px] text-gray-400">Full Access</p>
              </div>
            </div>
            <div className="w-px h-6 bg-gray-200 hidden sm:block" />
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 text-xs font-semibold transition-all">
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

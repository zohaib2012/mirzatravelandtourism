import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaBars, FaTimes, FaTachometerAlt, FaPlane, FaKaaba, FaCalculator,
  FaMoneyBillWave, FaFileInvoiceDollar, FaUniversity, FaUser, FaKey,
  FaSignOutAlt, FaChevronDown, FaHome, FaBox, FaHotel, FaBell,
} from "react-icons/fa";

const SIDEBAR_W = 270;

const menuItems = [
  { to: "/agent", icon: FaTachometerAlt, label: "Dashboard", end: true },
  {
    label: "Flight Groups", icon: FaPlane, children: [
      { to: "/agent/groups", label: "One Way Groups" },
      { to: "/agent/groups?category=UMRAH", label: "Umrah Groups" },
    ],
  },
  {
    label: "Bookings", icon: FaBox, children: [
      { to: "/agent/bookings", label: "All Bookings" },
      { to: "/agent/bookings?type=AIRLINE", label: "Airline Bookings" },
      { to: "/agent/bookings?type=PACKAGE", label: "Package Bookings" },
    ],
  },
  { to: "/agent/packages", icon: FaKaaba, label: "Umrah Packages" },
  { to: "/agent/calculator", icon: FaCalculator, label: "Umrah Calculator" },
  { to: "/agent/hotel-rates", icon: FaHotel, label: "Hotel Rates" },
  { divider: true },
  { to: "/agent/bank-details", icon: FaUniversity, label: "Bank Details", accent: true },
  {
    label: "Finance", icon: FaMoneyBillWave, children: [
      { to: "/agent/payments", label: "Add Payment" },
      { to: "/agent/ledger", label: "View Ledger" },
    ],
  },
  { divider: true },
  { to: "/agent/profile", icon: FaUser, label: "My Profile" },
  { to: "/agent/change-password", icon: FaKey, label: "Change Password" },
];

const SidebarLink = ({ to, icon: Icon, label, end, accent, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
        isActive
          ? "bg-gradient-to-r from-accent to-accent/90 text-primary shadow-lg shadow-accent/30 font-bold"
          : accent
          ? "text-orange-300 hover:bg-white/10 hover:text-orange-200 hover:translate-x-0.5"
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
      className="w-full flex items-center justify-between mx-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 group"
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

const AgentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const overlayRef = useRef();

  // Close mobile sidebar on route change
  useEffect(() => setMobileSidebarOpen(false), [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (mobileSidebarOpen && overlayRef.current === e.target) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileSidebarOpen]);

  const toggleMenu = (label) =>
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = ({ onNavigate }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-50" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center font-bold text-primary text-xl shadow-lg shadow-accent/30 shrink-0">
            {user?.agencyName?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.agencyName || "Agent"}</p>
            <p className="text-xs text-white/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="truncate">{user?.agentCode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 scrollbar-hide">
        <p className="px-5 pt-2 pb-2 text-[10px] font-bold text-white/25 uppercase tracking-widest">Main Menu</p>

        {menuItems.map((item, i) => {
          if (item.divider) return <div key={i} className="my-3 mx-4 border-t border-white/10" />;
          if (item.children) return (
            <ExpandableMenu
              key={item.label}
              item={item}
              expanded={!!expandedMenus[item.label]}
              onToggle={toggleMenu}
              onNavigate={onNavigate}
            />
          );
          return <SidebarLink key={item.to} {...item} onClick={onNavigate} />;
        })}

        <div className="my-3 mx-4 border-t border-white/10" />
        <NavLink to="/" onClick={onNavigate}
          className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-white/10 hover:text-white transition-all hover:translate-x-0.5">
          <FaHome className="text-base" /> 
          <span>Back to Website</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
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
        className={`hidden lg:flex flex-col bg-gradient-to-b from-[#0a2540] to-[#0C446F] text-white transition-all duration-300 shrink-0 ${
          sidebarOpen ? `w-[${SIDEBAR_W}px]` : "w-0 overflow-hidden"
        }`}
        style={{ width: sidebarOpen ? `${SIDEBAR_W}px` : 0 }}
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
            className="absolute left-0 top-0 bottom-0 flex flex-col bg-gradient-to-b from-[#0a2540] to-[#0C446F] text-white shadow-2xl"
            style={{ width: `${SIDEBAR_W}px` }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <span className="text-white font-bold text-sm">Agent Menu</span>
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
            {/* Desktop sidebar toggle */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl text-gray-500 hover:text-primary hover:bg-primary/5 transition-all">
              <FaBars className="text-lg" />
            </button>
            {/* Mobile sidebar toggle */}
            <button onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden flex w-10 h-10 items-center justify-center rounded-xl text-gray-500 hover:text-primary hover:bg-primary/5 transition-all">
              <FaBars className="text-lg" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <NavLink to="/" className="text-gray-400 hover:text-primary transition-colors text-xs">Home</NavLink>
              <span className="text-gray-300 text-xs">›</span>
              <span className="text-primary font-semibold text-xs">Agent</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User info */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-deepblue rounded-full flex items-center justify-center text-accent text-xs font-bold shadow border-2 border-accent/20">
                {user?.contactPerson?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-gray-800 leading-tight">{user?.contactPerson}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{user?.agentCode}</p>
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

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-4 py-3 text-center text-xs text-gray-400 shrink-0">
          © {new Date().getFullYear()} Mirza Travel & Tourism — Agent Portal
        </footer>
      </div>
    </div>
  );
};

export default AgentLayout;

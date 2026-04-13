import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTachometerAlt, FaUsers, FaPlane, FaBookOpen, FaKaaba, FaHotel, FaPassport, FaBus, FaMoneyBillWave, FaUniversity, FaCog, FaSignOutAlt, FaChevronDown, FaHome, FaChartBar, FaBuilding, FaCertificate, FaTags } from "react-icons/fa";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const menuItems = [
    { to: "/admin", icon: FaTachometerAlt, label: "Dashboard", end: true },
    { to: "/admin/agents", icon: FaUsers, label: "Agent Management" },
    {
      label: "Flight Management", icon: FaPlane, children: [
        { to: "/admin/airlines", label: "Airlines" },
        { to: "/admin/sectors", label: "Sectors/Routes" },
        { to: "/admin/groups", label: "Flight Groups" },
      ],
    },
    { to: "/admin/bookings", icon: FaBookOpen, label: "All Bookings" },
    {
      label: "Umrah Management", icon: FaKaaba, children: [
        { to: "/admin/packages", label: "Umrah Packages" },
        { to: "/admin/hotels", label: "Hotels" },
        { to: "/admin/visa-types", label: "Visa Types" },
        { to: "/admin/transport", label: "Transport" },
      ],
    },
    {
      label: "Finance", icon: FaMoneyBillWave, children: [
        { to: "/admin/payments", label: "Payment Verification" },
        { to: "/admin/bank-accounts", label: "Bank Accounts" },
        { to: "/admin/ledger", label: "Agent Ledgers" },
      ],
    },
    { to: "/admin/reports", icon: FaChartBar, label: "Reports" },
    {
      label: "Website Content", icon: FaBuilding, children: [
        { to: "/admin/branches", label: "Office Branches" },
        { to: "/admin/authorizations", label: "Authorizations" },
        { to: "/admin/deals", label: "Deals & Offers" },
      ],
    },
    { to: "/admin/settings", icon: FaCog, label: "Settings" },
  ];

  const [expandedMenus, setExpandedMenus] = useState({});
  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} bg-primary text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-primary-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-primary text-lg">M</div>
            <div>
              <p className="text-sm font-bold">Mirza Travel</p>
              <p className="text-xs text-blue-200">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-blue-200 hover:bg-primary-light hover:text-white"
                >
                  <span className="flex items-center gap-3"><item.icon className="text-xs" /> {item.label}</span>
                  <FaChevronDown className={`text-xs transition-transform ${expandedMenus[item.label] ? "rotate-180" : ""}`} />
                </button>
                {expandedMenus[item.label] && (
                  <div className="bg-primary-dark">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `block pl-12 pr-4 py-2 text-sm ${isActive ? "text-accent" : "text-blue-300 hover:text-accent"}`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm ${isActive ? "text-accent bg-primary-light" : "text-blue-200 hover:bg-primary-light hover:text-white"}`
                }
              >
                <item.icon className="text-xs" /> {item.label}
              </NavLink>
            )
          )}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-primary">
              <FaBars />
            </button>
            <h1 className="text-sm font-semibold text-primary">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Admin</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

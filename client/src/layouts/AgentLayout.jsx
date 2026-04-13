import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTachometerAlt, FaPlane, FaKaaba, FaCalculator, FaMoneyBillWave, FaFileInvoiceDollar, FaUniversity, FaUser, FaKey, FaSignOutAlt, FaChevronDown, FaHome, FaBox } from "react-icons/fa";

const AgentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
    { to: "/agent/hotel-rates", icon: FaKaaba, label: "Hotel Rates" },
    { to: "/agent/bank-details", icon: FaUniversity, label: "Bank Details", className: "text-orange-500" },
    {
      label: "Accounts", icon: FaMoneyBillWave, children: [
        { to: "/agent/payments", label: "Add Payments" },
        { to: "/agent/ledger", label: "Ledger" },
      ],
    },
    { to: "/agent/profile", icon: FaUser, label: "My Profile" },
    { to: "/agent/change-password", icon: FaKey, label: "Change Password" },
  ];

  const [expandedMenus, setExpandedMenus] = useState({});
  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} bg-[#343a40] text-white transition-all duration-300 flex flex-col`}>
        {/* Brand */}
        <div className="p-4 border-b border-gray-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-primary">
              {user?.agencyName?.[0] || "M"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.agencyName}</p>
              <p className="text-xs text-gray-400">Agent Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          <NavLink to="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-accent">
            <FaHome /> Go Back To Website
          </NavLink>
          <div className="border-b border-gray-600 my-1" />

          {menuItems.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="text-xs" /> {item.label}
                  </span>
                  <FaChevronDown className={`text-xs transition-transform ${expandedMenus[item.label] ? "rotate-180" : ""}`} />
                </button>
                {expandedMenus[item.label] && (
                  <div className="bg-[#2c3136]">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `block pl-12 pr-4 py-2 text-sm ${isActive ? "text-accent bg-gray-700" : "text-gray-400 hover:text-accent"}`
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
                  `flex items-center gap-3 px-4 py-2.5 text-sm ${item.className || ""} ${
                    isActive ? "text-accent bg-gray-700" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
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
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-primary">
              <FaBars />
            </button>
            <NavLink to="/" className="text-sm text-primary hover:text-accent">Home</NavLink>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Welcome, <b>{user?.contactPerson}</b></span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t px-4 py-2 text-center text-xs text-gray-400">
          Designed and Developed by Mirza Travel & Tourism
        </footer>
      </div>
    </div>
  );
};

export default AgentLayout;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { FaUsers, FaUserClock, FaPlane, FaBookOpen, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaArrowRight, FaChartLine, FaCalendarAlt, FaBox } from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FaBox className="text-primary text-xl animate-pulse" />
        </div>
      </div>
    </div>
  );

  const cards = [
    { title: "Total Agents", count: stats?.totalAgents || 0, icon: FaUsers, color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/30", link: "/admin/agents" },
    { title: "Pending Approvals", count: stats?.pendingAgents || 0, icon: FaUserClock, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/30", link: "/admin/agents?status=PENDING" },
    { title: "Active Groups", count: stats?.activeGroups || 0, icon: FaPlane, color: "from-cyan-500 to-cyan-600", shadow: "shadow-cyan-500/30", link: "/admin/groups" },
    { title: "Total Bookings", count: stats?.totalBookings || 0, icon: FaBookOpen, color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/30", link: "/admin/bookings" },
    { title: "Confirmed", count: stats?.confirmedBookings || 0, icon: FaCheckCircle, color: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/30", link: "/admin/bookings?status=CONFIRMED" },
    { title: "Cancelled", count: stats?.cancelledBookings || 0, icon: FaTimesCircle, color: "from-red-500 to-red-600", shadow: "shadow-red-500/30", link: "/admin/bookings?status=CANCELLED" },
    { title: "Total Revenue", count: `PKR ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: FaMoneyBillWave, color: "from-teal-500 to-teal-600", shadow: "shadow-teal-500/30", link: "/admin/reports" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <FaCalendarAlt className="text-accent" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Link key={i} to={card.link} 
            className={`relative overflow-hidden bg-gradient-to-br ${card.color} rounded-2xl shadow-lg ${card.shadow} text-white p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group`}>
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium opacity-90">{card.title}</p>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <card.icon className="text-lg" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{card.count}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-80">
                <span>View details</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FaChartLine className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">Recent Bookings</h2>
              <p className="text-xs text-gray-400">Latest bookings from all agents</p>
            </div>
          </div>
          <Link to="/admin/bookings" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-4 text-left font-semibold">Booking No</th>
                <th className="px-5 py-4 text-left font-semibold">Agent</th>
                <th className="px-5 py-4 text-left font-semibold">Group</th>
                <th className="px-5 py-4 text-left font-semibold">Seats</th>
                <th className="px-5 py-4 text-left font-semibold">Status</th>
                <th className="px-5 py-4 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentBookings?.map((b, i) => (
                <tr key={b.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                  <td className="px-5 py-4">
                    <span className="font-bold text-primary">{b.bookingNo}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-gray-700">{b.agent?.agencyName}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{b.group?.groupName?.substring(0, 30) || "Package"}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary font-semibold rounded-lg">{b.totalSeats}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      b.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" :
                      b.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      b.status === "ON_REQUEST" ? "bg-amber-100 text-amber-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!stats?.recentBookings?.length && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FaBox className="text-3xl opacity-30" />
                      <p>No bookings yet</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { FaUsers, FaUserClock, FaPlane, FaBookOpen, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaArrowRight } from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  const cards = [
    { title: "Total Agents", count: stats?.totalAgents || 0, icon: FaUsers, color: "bg-blue-600", link: "/admin/agents" },
    { title: "Pending Approvals", count: stats?.pendingAgents || 0, icon: FaUserClock, color: "bg-yellow-500", link: "/admin/agents?status=PENDING" },
    { title: "Active Groups", count: stats?.activeGroups || 0, icon: FaPlane, color: "bg-cyan-600", link: "/admin/groups" },
    { title: "Total Bookings", count: stats?.totalBookings || 0, icon: FaBookOpen, color: "bg-purple-600", link: "/admin/bookings" },
    { title: "Confirmed", count: stats?.confirmedBookings || 0, icon: FaCheckCircle, color: "bg-green-600", link: "/admin/bookings?status=CONFIRMED" },
    { title: "Cancelled", count: stats?.cancelledBookings || 0, icon: FaTimesCircle, color: "bg-red-600", link: "/admin/bookings?status=CANCELLED" },
    { title: "Total Revenue", count: `PKR ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: FaMoneyBillWave, color: "bg-emerald-600", link: "/admin/reports" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <Link key={i} to={card.link} className={`${card.color} rounded-lg shadow-md text-white p-5 hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-80">{card.title}</p>
              <card.icon className="text-2xl opacity-30" />
            </div>
            <p className="text-2xl font-bold">{card.count}</p>
            <div className="mt-2 flex items-center gap-1 text-xs opacity-80">
              View details <FaArrowRight />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-sm text-accent hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Booking No</th>
                <th className="px-4 py-3 text-left">Agent</th>
                <th className="px-4 py-3 text-left">Group</th>
                <th className="px-4 py-3 text-left">Seats</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentBookings?.map((b, i) => (
                <tr key={b.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-semibold text-primary">{b.bookingNo}</td>
                  <td className="px-4 py-3">{b.agent?.agencyName}</td>
                  <td className="px-4 py-3">{b.group?.groupName?.substring(0, 30) || "Package"}</td>
                  <td className="px-4 py-3">{b.totalSeats}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      b.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                      b.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                      b.status === "ON_REQUEST" ? "bg-yellow-100 text-yellow-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!stats?.recentBookings?.length && (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { FaChartBar, FaUsers, FaPlane, FaMoneyBillWave, FaCalendarAlt } from "react-icons/fa";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["#0C446F","#FAAF43","#22c55e","#ef4444","#8b5cf6","#06b6d4"];

const StatCard = ({ icon: Icon, label, value, sub, color = "primary" }) => {
  const colors = {
    primary: "from-primary to-blue-700",
    green: "from-green-500 to-green-700",
    orange: "from-orange-400 to-orange-600",
    red: "from-red-500 to-red-700",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl p-5 shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
        </div>
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getReports()
      .then(({ data }) => setData(data))
      .catch(() => toast.error("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) return <div className="text-center text-gray-500 py-20">No data available</div>;

  const { totals, bookingsByType, recentBookings, topAgents, monthlyBookings } = data;

  // Prepare monthly chart data
  const monthlyData = MONTHS.map((m, i) => {
    const found = (monthlyBookings || []).find((r) => r.month === i + 1);
    return { month: m, bookings: found?.count || 0, revenue: Math.round((found?.revenue || 0) / 1000) };
  });

  // Booking type pie
  const pieData = (bookingsByType || []).map((b) => ({
    name: b.bookingType,
    value: b._count,
  }));

  const confirmRate = totals.bookings > 0
    ? Math.round((totals.confirmed / totals.bookings) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <FaChartBar className="text-primary text-2xl" />
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FaPlane} label="Total Bookings" value={totals.bookings}
          sub={`${totals.confirmed} confirmed`} color="primary" />
        <StatCard icon={FaMoneyBillWave} label="Total Revenue" color="green"
          value={`PKR ${(totals.revenue / 1000000).toFixed(1)}M`}
          sub={`${totals.payments.toLocaleString()} received`} />
        <StatCard icon={FaUsers} label="Total Agents" color="orange"
          value={totals.agents} sub={`${totals.activeAgents} active`} />
        <StatCard icon={FaCalendarAlt} label="Confirmation Rate" color="green"
          value={`${confirmRate}%`}
          sub={`${totals.cancelled} cancelled`} />
      </div>

      {/* Booking Status Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-green-500">
          <p className="text-3xl font-bold text-green-600">{totals.confirmed}</p>
          <p className="text-sm text-gray-500 mt-1">Confirmed</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-yellow-400">
          <p className="text-3xl font-bold text-yellow-600">{totals.pending}</p>
          <p className="text-sm text-gray-500 mt-1">On Request</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center border-t-4 border-red-500">
          <p className="text-3xl font-bold text-red-600">{totals.cancelled}</p>
          <p className="text-sm text-gray-500 mt-1">Cancelled</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Bookings Bar Chart */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md p-5">
          <h3 className="font-bold text-gray-700 mb-4">Monthly Bookings (Current Year)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val, name) => name === "revenue" ? `PKR ${val}K` : val} />
              <Bar dataKey="bookings" fill="#0C446F" radius={[4,4,0,0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Type Pie */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="font-bold text-gray-700 mb-4">Booking Types</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No booking data</div>
          )}
        </div>
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h3 className="font-bold text-gray-700 mb-4">Monthly Revenue (PKR thousands)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(val) => `PKR ${val}K`} />
            <Bar dataKey="revenue" fill="#FAAF43" radius={[4,4,0,0]} name="Revenue (K)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row: Top Agents + Recent Bookings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Agents */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="font-bold text-gray-700 mb-4">Top 5 Agents by Bookings</h3>
          {topAgents.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data</p>
          ) : (
            <div className="space-y-3">
              {topAgents.map((a, i) => (
                <div key={a.agentId} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-400" : "bg-primary"
                  }`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-700">Agent #{a.agentId}</div>
                    <div className="text-xs text-gray-400">Revenue: PKR {Number(a._sum.totalPrice || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary">{a._count.id}</span>
                    <div className="text-xs text-gray-400">bookings</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="font-bold text-gray-700 mb-4">Recent Bookings</h3>
          <div className="space-y-2">
            {(recentBookings || []).slice(0, 6).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div>
                  <div className="text-sm font-semibold">{b.bookingNo}</div>
                  <div className="text-xs text-gray-400">{b.agent?.agencyName} · {b.group?.airline?.name || b.bookingType}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">PKR {Number(b.totalPrice).toLocaleString()}</div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                    b.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                    b.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

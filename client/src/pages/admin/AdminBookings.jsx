import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import { useConfirm } from "../../components/common/ConfirmDialog";

const statusColors = {
  ON_REQUEST: "bg-yellow-100 text-yellow-800",
  PARTIAL: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    bookingType: "",
  });
  const { confirm, Dialog } = useConfirm();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.bookingType) params.bookingType = filters.bookingType;
      const { data } = await adminAPI.getAllBookings(params);
      setBookings(data.bookings || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const ok = await confirm({ title: "Update Booking Status", message: `Change booking status to "${status}"?`, confirmLabel: "Yes, Update", confirmColor: "blue" });
    if (!ok) return;
    try {
      await adminAPI.updateBookingStatus(id, { status });
      toast.success("Booking status updated!");
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800">All Bookings</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-5 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded text-sm">
            <option value="">All Status</option>
            <option value="ON_REQUEST">On Request</option>
            <option value="PARTIAL">Partial</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select value={filters.bookingType} onChange={(e) => setFilters({ ...filters, bookingType: e.target.value })}
            className="px-3 py-2 border rounded text-sm">
            <option value="">All Types</option>
            <option value="AIRLINE">Airline</option>
            <option value="PACKAGE">Package</option>
          </select>
        </div>
        <button onClick={load} className="px-4 py-2 bg-primary text-white rounded flex items-center gap-2 hover:opacity-90">
          <FaSearch /> Filter
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-3 py-3 text-left">Booking #</th>
              <th className="px-3 py-3 text-left">Agent</th>
              <th className="px-3 py-3 text-left">Type</th>
              <th className="px-3 py-3 text-left">Group / Package</th>
              <th className="px-3 py-3 text-left">Pax</th>
              <th className="px-3 py-3 text-left">Amount</th>
              <th className="px-3 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Change Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">No bookings found</td></tr>
            ) : bookings.map((b, i) => (
              <tr key={b.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                <td className="px-3 py-3 font-bold text-primary">{b.bookingNo}</td>
                <td className="px-3 py-3">
                  <div className="font-semibold">{b.agent?.agencyName || b.agent?.contactPerson}</div>
                  <div className="text-xs text-gray-500">{b.agent?.agentCode}</div>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${b.bookingType === "PACKAGE" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                    {b.bookingType}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {b.bookingType === "PACKAGE" ? (
                    <div className="text-xs">{b.package?.packageName || `PKG-${b.packageId}`}</div>
                  ) : (
                    <div className="text-xs">
                      <div className="font-medium">{b.group?.airline?.name}</div>
                      <div className="text-gray-500">{b.group?.sector?.routeDisplay}</div>
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-center">{b.totalSeats}</td>
                <td className="px-3 py-3 font-bold text-green-700">PKR {Number(b.totalPrice).toLocaleString()}</td>
                <td className="px-3 py-3 text-xs">{format(new Date(b.createdAt), "dd MMM yyyy")}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[b.status] || "bg-gray-100"}`}>
                    {b.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {b.status !== "CANCELLED" && (
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className="px-2 py-1 border rounded text-xs"
                    >
                      <option value="ON_REQUEST">On Request</option>
                      <option value="PARTIAL">Partial</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t text-sm text-gray-500">
          Total: {bookings.length} bookings
        </div>
      </div>
      {Dialog}
    </div>
  );
};

export default AdminBookings;

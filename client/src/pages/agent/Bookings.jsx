import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { bookingAPI } from "../../services/api";
import { format, differenceInSeconds } from "date-fns";
import toast from "react-hot-toast";
import VoucherPrint from "../../components/agent/VoucherPrint";
import Voucher2Print from "../../components/agent/Voucher2Print";
import TicketPrint from "../../components/agent/TicketPrint";
import { FaPlane, FaCalendarAlt, FaBox } from "react-icons/fa";

const Bookings = () => {
  const [searchParams] = useSearchParams();
  const bookingType = searchParams.get("type") || "";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printBooking, setPrintBooking] = useState(null);
  const [printType, setPrintType] = useState(null); // "ticket" | "voucher1" | "voucher2"

  const handlePrint = (booking, type) => {
    setPrintBooking(booking);
    setPrintType(type);
  };
  const [filters, setFilters] = useState({
    dateFrom: format(new Date(new Date().setDate(1)), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
    status: "all",
    bookingType: bookingType,
  });

  const pageTitle = bookingType === "AIRLINE" ? "One Way Airline Group Booking"
    : bookingType === "PACKAGE" ? "Umrah Package Bookings"
    : "All Airline Group Booking";

  const breadcrumb = bookingType === "AIRLINE" ? "All One Way Airline Groups"
    : bookingType === "PACKAGE" ? "Bookings"
    : "All Airline Groups";

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      };
      if (filters.status !== "all") params.status = filters.status;
      if (filters.bookingType) params.bookingType = filters.bookingType;

      const { data } = await bookingAPI.getMy(params);
      setBookings(data.bookings || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadBookings();
  };

  const getStatusBadge = (status) => {
    const map = {
      ON_REQUEST: { bg: "bg-yellow-100 text-yellow-800", label: "On Request" },
      PARTIAL: { bg: "bg-blue-100 text-blue-800", label: "Partial" },
      CONFIRMED: { bg: "bg-green-100 text-green-800", label: "Confirmed" },
      CANCELLED: { bg: "bg-red-100 text-red-800", label: "CANCELLED" },
    };
    const s = map[status] || { bg: "bg-gray-100 text-gray-800", label: status };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${s.bg}`}>{s.label}</span>;
  };

  const getCategoryBadge = (booking) => {
    if (booking.bookingType === "PACKAGE") return <span className="text-xs font-bold text-green-600">UMRAH GROUP</span>;
    const cat = booking.group?.category;
    if (cat === "UMRAH") return <span className="text-xs font-bold text-green-600">UMRAH GROUP</span>;
    if (cat === "UAE_ONE_WAY") return <span className="text-xs font-bold text-blue-600">UAE</span>;
    if (cat === "KSA_ONE_WAY") return <span className="text-xs font-bold text-purple-600">KSA</span>;
    return <span className="text-xs font-bold text-gray-600">{cat}</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-deepblue flex items-center justify-center shadow-lg shadow-primary/30">
            <FaPlane className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">{pageTitle}</h1>
            <p className="text-gray-500 text-sm">Manage your bookings</p>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4" style={{ background: "linear-gradient(135deg, #0C446F 0%, #034264 100%)" }}>
          <form onSubmit={handleFilter}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-white/90">
                  {bookingType === "PACKAGE" ? "Date From" : "Departure From"}
                </label>
                <input type="date" value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-0 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-white/90">
                  {bookingType === "PACKAGE" ? "Date To" : "Departure To"}
                </label>
                <input type="date" value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-0 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              {!bookingType && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-white/90">Status</label>
                  <select value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-0 text-sm focus:ring-2 focus:ring-accent outline-none">
                    <option value="all">All</option>
                    <option value="ON_REQUEST">On Request</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="CONFIRMED">Confirm</option>
                    <option value="CANCELLED">Cancel</option>
                  </select>
                </div>
              )}
              <div>
                <button type="submit" className="w-full px-6 py-2.5 bg-accent text-primary font-bold rounded-xl hover:bg-accent/90 transition-all hover:shadow-lg mt-5">
                  Filter
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 text-left font-semibold">Sr #</th>
                <th className="px-5 py-4 text-left font-semibold">Booking No</th>
                <th className="px-5 py-4 text-left font-semibold">
                  {bookingType === "PACKAGE" ? "Package" : "Group"}
                </th>
                {bookingType === "PACKAGE" && <th className="px-5 py-4 text-left font-semibold">Room Type</th>}
                <th className="px-5 py-4 text-left font-semibold">Passenger</th>
                <th className="px-5 py-4 text-left font-semibold">Status</th>
                <th className="px-5 py-4 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
                      Loading bookings...
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FaBox className="text-4xl opacity-30" />
                      <p>No bookings found</p>
                    </div>
                  </td>
                </tr>
              ) : bookings.map((b, i) => (
                <tr key={b.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : "bg-white"}`}>
                  <td className="px-5 py-4 text-gray-500 font-medium">{i + 1}</td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg inline-block text-xs mb-1">{b.bookingNo}</div>
                    {getCategoryBadge(b)}
                    <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" />
                      {format(new Date(b.createdAt), "EEE dd MMM yyyy HH:mm")}
                    </div>
                    {b.autoCancelledAt && (
                      <div className="text-xs text-red-500 mt-1">
                        Auto Cancelled: {format(new Date(b.autoCancelledAt), "EEE dd MMM yyyy HH:mm")}
                      </div>
                    )}
                    {b.status === "ON_REQUEST" && b.expiryTime && (
                      <CountdownTimer expiry={b.expiryTime} />
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {bookingType === "PACKAGE" ? (
                      <div>
                        <div className="font-medium text-gray-800">Package: <b>{b.package?.packageName || "N/A"}</b></div>
                        <div className="text-xs text-blue-600 font-medium mt-0.5">
                          AG-{b.packageId} (Dep: {b.package?.departureDate ? format(new Date(b.package.departureDate), "yyyy-MM-dd") : "N/A"})
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-gray-500">{b.group?.airline?.name} - {b.group?.sector?.routeDisplay}</div>
                        <div className="font-bold text-sm text-gray-800">{b.group?.airline?.name}</div>
                        <div className="text-xs text-blue-600">AG - {b.groupId}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <FaPlane className="text-gray-400" />
                          Dep: {b.group?.departureDate ? format(new Date(b.group.departureDate), "EEE dd MMM yyyy") : ""}
                        </div>
                      </div>
                    )}
                  </td>
                  {bookingType === "PACKAGE" && (
                    <td className="px-5 py-4">
                      <span className="font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg text-xs">Room: {b.roomType || "N/A"}</span>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <table className="text-xs border border-gray-100 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2.5 py-2 font-medium">Adults</th>
                          <th className="px-2.5 py-2 font-medium">Child</th>
                          <th className="px-2.5 py-2 font-medium">Infant</th>
                          <th className="px-2.5 py-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2.5 py-2 text-center">{b.adultsCount}</td>
                          <td className="px-2.5 py-2 text-center">{b.childrenCount}</td>
                          <td className="px-2.5 py-2 text-center">{b.infantsCount}</td>
                          <td className="px-2.5 py-2 text-center font-bold text-primary">{b.totalSeats}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(b.status)}
                    {b.bookingType === "PACKAGE" && b.status !== "CANCELLED" && (
                      <div className="mt-2 space-y-1.5">
                        <button onClick={() => handlePrint(b, "voucher1")} className="block w-full text-xs px-2.5 py-1.5 bg-blue-500 text-white rounded-lg text-center hover:bg-blue-600 transition-all">Voucher</button>
                        <button onClick={() => handlePrint(b, "voucher2")} className="block w-full text-xs px-2.5 py-1.5 bg-amber-500 text-white rounded-lg text-center hover:bg-amber-600 transition-all">Voucher 2</button>
                      </div>
                    )}
                    {b.bookingType === "AIRLINE" && b.status !== "CANCELLED" && (
                      <div className="mt-2">
                        <button onClick={() => handlePrint(b, "ticket")} className="block w-full text-xs px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-center hover:bg-red-600 transition-all">Print Ticket</button>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Link to={`/agent/bookings/${b.id}`} className="px-3.5 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-all hover:shadow-md inline-block">
                      {b.bookingType === "PACKAGE" ? "Details" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination info */}
        <div className="px-5 py-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
          <span>Showing <span className="font-semibold text-primary">{bookings.length}</span> entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-all">Previous</button>
            <button className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-all">Next</button>
          </div>
        </div>
      </div>

      {/* Print Components */}
      {printBooking && printType === "ticket" && (
        <TicketPrint booking={printBooking} onClose={() => { setPrintBooking(null); setPrintType(null); }} />
      )}
      {printBooking && printType === "voucher1" && (
        <VoucherPrint booking={printBooking} onClose={() => { setPrintBooking(null); setPrintType(null); }} />
      )}
      {printBooking && printType === "voucher2" && (
        <Voucher2Print booking={printBooking} onClose={() => { setPrintBooking(null); setPrintType(null); }} />
      )}
    </div>
  );
};

// FlipClock style Countdown Timer
const CountdownTimer = ({ expiry }) => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = differenceInSeconds(new Date(expiry), new Date());
      if (diff <= 0) {
        setExpired(true);
        setTime({ h: 0, m: 0, s: 0 });
      } else {
        setTime({
          h: Math.floor(diff / 3600),
          m: Math.floor((diff % 3600) / 60),
          s: diff % 60,
        });
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [expiry]);

  if (expired) {
    return (
      <div className="mt-1">
        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
          ⏰ EXPIRED
        </span>
      </div>
    );
  }

  const pad = (n) => n.toString().padStart(2, "0");
  const isUrgent = time.h === 0 && time.m < 30;

  return (
    <div className="mt-1">
      <span className="text-xs text-gray-500">Expires in:</span>
      <div className="flex items-center gap-0.5 mt-0.5">
        {[
          { val: pad(time.h), label: "H" },
          { val: pad(time.m), label: "M" },
          { val: pad(time.s), label: "S" },
        ].map((unit, i) => (
          <div key={i} className="flex items-end gap-0.5">
            {i > 0 && <span className={`text-sm font-bold mb-1 ${isUrgent ? "text-red-500" : "text-gray-400"}`}>:</span>}
            <div className="text-center">
              <div
                className={`w-8 h-7 flex items-center justify-center rounded text-xs font-mono font-bold text-white shadow-sm
                  ${isUrgent ? "bg-red-600" : "bg-gray-700"}`}
              >
                {unit.val}
              </div>
              <div className="text-gray-400" style={{ fontSize: "9px" }}>{unit.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookings;

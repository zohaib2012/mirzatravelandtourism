import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { bookingAPI } from "../../services/api";
import { format, differenceInSeconds } from "date-fns";
import toast from "react-hot-toast";
import VoucherPrint from "../../components/agent/VoucherPrint";
import Voucher2Print from "../../components/agent/Voucher2Print";
import TicketPrint from "../../components/agent/TicketPrint";

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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
        <nav className="text-sm text-gray-500">
          <Link to="/agent" className="text-primary hover:underline">Home</Link> / {breadcrumb}
        </nav>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <form onSubmit={handleFilter} className="p-4" style={{ backgroundColor: "#1d6eed" }}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {bookingType === "PACKAGE" ? "Date From" : "Departure From"}
              </label>
              <input type="date" value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 rounded border-0 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {bookingType === "PACKAGE" ? "Date To" : "Departure To"}
              </label>
              <input type="date" value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 rounded border-0 text-sm" />
            </div>
            {!bookingType && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">Status</label>
                <select value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 rounded border-0 text-sm">
                  <option value="all">All</option>
                  <option value="ON_REQUEST">On Request</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="CONFIRMED">Confirm</option>
                  <option value="CANCELLED">Cancel</option>
                </select>
              </div>
            )}
            <div>
              <button type="submit" className="px-6 py-2 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600 mt-5">
                Filter
              </button>
            </div>
          </div>
        </form>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-3 py-3 text-left whitespace-nowrap">Sr #</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Booking No</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">
                  {bookingType === "PACKAGE" ? "Package" : "Group"}
                </th>
                {bookingType === "PACKAGE" && <th className="px-3 py-3 text-left whitespace-nowrap">Room Type</th>}
                <th className="px-3 py-3 text-left whitespace-nowrap">Passenger</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Status</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400">No bookings found</td></tr>
              ) : bookings.map((b, i) => (
                <tr key={b.id} className={`border-b ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                  <td className="px-3 py-3">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="font-bold text-primary">{b.bookingNo}</div>
                    {getCategoryBadge(b)}
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {format(new Date(b.createdAt), "EEE dd MMM yyyy HH:mm")}
                    </div>
                    {b.autoCancelledAt && (
                      <div className="text-xs text-red-500">
                        Auto Cancelled on: {format(new Date(b.autoCancelledAt), "EEE dd MMM yyyy HH:mm")}
                      </div>
                    )}
                    {/* Countdown Timer */}
                    {b.status === "ON_REQUEST" && b.expiryTime && (
                      <CountdownTimer expiry={b.expiryTime} />
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {bookingType === "PACKAGE" ? (
                      <div>
                        <div className="font-medium">Package: <b>{b.package?.packageName || "N/A"}</b></div>
                        <div className="text-xs text-blue-600 font-medium">
                          AG-{b.packageId} (Dep Date: {b.package?.departureDate ? format(new Date(b.package.departureDate), "yyyy-MM-dd") : "N/A"})
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs">{b.group?.airline?.name}-{b.group?.sector?.routeDisplay}</div>
                        <div className="font-bold text-sm">{b.group?.airline?.name}</div>
                        <div className="text-xs text-blue-600">AG - {b.groupId}</div>
                        <div className="text-xs text-gray-500">
                          Dep: {b.group?.departureDate ? format(new Date(b.group.departureDate), "EEE dd MMM yyyy") : ""}
                        </div>
                      </div>
                    )}
                  </td>
                  {bookingType === "PACKAGE" && (
                    <td className="px-3 py-3">
                      <span className="font-medium" style={{ color: "darkgoldenrod" }}>Room Type: {b.roomType || "N/A"}</span>
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <table className="text-xs border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-1">Adults</th>
                          <th className="px-2 py-1">Child</th>
                          <th className="px-2 py-1">Infant</th>
                          <th className="px-2 py-1">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-1 text-center">{b.adultsCount}</td>
                          <td className="px-2 py-1 text-center">{b.childrenCount}</td>
                          <td className="px-2 py-1 text-center">{b.infantsCount}</td>
                          <td className="px-2 py-1 text-center font-bold">{b.totalSeats}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="px-3 py-3">
                    {getStatusBadge(b.status)}
                    {b.bookingType === "PACKAGE" && b.status !== "CANCELLED" && (
                      <div className="mt-1 space-y-1">
                        <button onClick={() => handlePrint(b, "voucher1")} className="block w-full text-xs px-2 py-1 bg-blue-500 text-white rounded text-center hover:bg-blue-600">📋 Voucher</button>
                        <button onClick={() => handlePrint(b, "voucher2")} className="block w-full text-xs px-2 py-1 bg-yellow-500 text-white rounded text-center hover:bg-yellow-600">📄 Voucher 2</button>
                      </div>
                    )}
                    {b.bookingType === "AIRLINE" && b.status !== "CANCELLED" && (
                      <div className="mt-1">
                        <button onClick={() => handlePrint(b, "ticket")} className="block w-full text-xs px-2 py-1 bg-red-500 text-white rounded text-center hover:bg-red-600">🎫 Print Ticket</button>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Link to={`/agent/bookings/${b.id}`} className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
                      {b.bookingType === "PACKAGE" ? "Details" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination info */}
        <div className="px-4 py-3 border-t text-sm text-gray-500 flex justify-between items-center">
          <span>Showing {bookings.length} entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded text-gray-400">Previous</button>
            <button className="px-3 py-1 bg-blue-500 text-white rounded">1</button>
            <button className="px-3 py-1 border rounded text-gray-400">Next</button>
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

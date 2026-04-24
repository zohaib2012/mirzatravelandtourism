import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { bookingAPI } from "../../services/api";
import { format } from "date-fns";
import TicketPrint from "../../components/agent/TicketPrint";
import VoucherPrint from "../../components/agent/VoucherPrint";
import Voucher2Print from "../../components/agent/Voucher2Print";

const BookingDetail = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTicket, setShowTicket] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const [showVoucher2, setShowVoucher2] = useState(false);

  useEffect(() => {
    bookingAPI.getById(id)
      .then(({ data }) => setBooking(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  if (!booking) return <div className="text-center py-8 text-gray-400">Booking not found</div>;

  const getStatusBadge = (status) => {
    const map = {
      ON_REQUEST: "bg-yellow-500", PARTIAL: "bg-blue-500",
      CONFIRMED: "bg-green-500", CANCELLED: "bg-red-500",
    };
    return <span className={`px-3 py-1 ${map[status] || "bg-gray-500"} text-white text-sm rounded font-bold`}>{status.replace("_", " ")}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Airline Booking</h1>
        <nav className="text-sm text-gray-500">
          <Link to="/agent" className="text-primary hover:underline">Home</Link> /
          <Link to="/agent/bookings" className="text-primary hover:underline ml-1">Bookings</Link> /
          <span className="ml-1">My Airline Booking Details</span>
        </nav>
      </div>

      {/* Booking Info Header */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-5">
        <h3 className="text-red-500 text-lg font-bold">Added By User - {booking.agent?.contactPerson}</h3>
        <h4 className="text-gray-700 mt-1">Booked On: {format(new Date(booking.createdAt), "EEE dd MMM yyyy")}</h4>
        <h4 className="text-red-600 mt-1">AG#: {booking.groupId || booking.packageId} - BK#: {booking.id}</h4>
        <div className="mt-2">{getStatusBadge(booking.status)}</div>
      </div>

      {/* Flight Legs Table */}
      {booking.group?.flightLegs?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-4 text-white font-bold" style={{ backgroundColor: "#1d6eed" }}>
            <h3>Airline Group Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-3 py-2">Flight#</th>
                  <th className="px-3 py-2">Dep Date</th>
                  <th className="px-3 py-2">Dep Time</th>
                  <th className="px-3 py-2">Sector From</th>
                  <th className="px-3 py-2">From Terminal</th>
                  <th className="px-3 py-2">Sector TO</th>
                  <th className="px-3 py-2">To Terminal</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Arr Date</th>
                  <th className="px-3 py-2">Arr Time</th>
                  <th className="px-3 py-2">Meal</th>
                  <th className="px-3 py-2">Baggage</th>
                </tr>
              </thead>
              <tbody>
                {booking.group.flightLegs.map((leg, i) => (
                  <tr key={leg.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                    <td className="px-3 py-2 font-bold">{leg.flightNumber}</td>
                    <td className="px-3 py-2">{format(new Date(leg.departureDate), "dd MMM yyyy")}</td>
                    <td className="px-3 py-2">{leg.departureTime || "-"}</td>
                    <td className="px-3 py-2 font-bold">{leg.origin}</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2 font-bold">{leg.destination}</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2">Economy</td>
                    <td className="px-3 py-2">{format(new Date(leg.departureDate), "dd MMM yyyy")}</td>
                    <td className="px-3 py-2">{leg.arrivalTime || "-"}</td>
                    <td className="px-3 py-2">Included</td>
                    <td className="px-3 py-2">{leg.baggage || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Package Hotels */}
      {booking.package?.packageHotels?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-4 text-white font-bold" style={{ backgroundColor: "#1d6eed" }}>
            <h3>Hotel Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Hotel</th>
                  <th className="px-3 py-2">Nights</th>
                  <th className="px-3 py-2">Check-in</th>
                  <th className="px-3 py-2">Check-out</th>
                </tr>
              </thead>
              <tbody>
                {booking.package.packageHotels.map((ph, i) => (
                  <tr key={ph.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-bold">{ph.city}</td>
                    <td className="px-3 py-2">{ph.hotel?.name}</td>
                    <td className="px-3 py-2">{ph.nights}</td>
                    <td className="px-3 py-2">{ph.checkinDate ? format(new Date(ph.checkinDate), "dd MMM yyyy") : "-"}</td>
                    <td className="px-3 py-2">{ph.checkoutDate ? format(new Date(ph.checkoutDate), "dd MMM yyyy") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Passengers Table */}
      {booking.passengers?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-4 text-white font-bold" style={{ backgroundColor: "#1d6eed" }}>
            <h3>Passenger Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Surname</th>
                  <th className="px-3 py-2">Given Name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Passport</th>
                </tr>
              </thead>
              <tbody>
                {booking.passengers.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                    <td className="px-3 py-2">{p.title || (p.type === "ADULT" ? "MR" : "MSTR")}</td>
                    <td className="px-3 py-2 font-bold">{p.surname || "-"}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs text-white ${p.type === "ADULT" ? "bg-blue-500" : p.type === "CHILD" ? "bg-green-500" : "bg-yellow-500"}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-3 py-2">{p.passportNo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-5">
        <h3 className="text-lg font-bold text-primary mb-3">Price Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-xs text-gray-500">Adults</p>
            <p className="text-lg font-bold">{booking.adultsCount}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-xs text-gray-500">Children</p>
            <p className="text-lg font-bold">{booking.childrenCount}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-xs text-gray-500">Infants</p>
            <p className="text-lg font-bold">{booking.infantsCount}</p>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <p className="text-xs text-gray-500">Total Price</p>
            <p className="text-lg font-bold text-red-600">PKR {Number(booking.totalPrice).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Link to="/agent/bookings" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Back to Bookings
        </Link>
        {booking.bookingType === "AIRLINE" && booking.status !== "CANCELLED" && (
          <button onClick={() => setShowTicket(true)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2">
            🎫 Print Ticket
          </button>
        )}
        {booking.bookingType === "PACKAGE" && booking.status !== "CANCELLED" && (
          <>
            <button onClick={() => setShowVoucher(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
              📋 Voucher 1
            </button>
            <button onClick={() => setShowVoucher2(true)} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-2">
              📄 Voucher 2
            </button>
          </>
        )}
      </div>

      {/* Print Components */}
      {showTicket && <TicketPrint booking={booking} onClose={() => setShowTicket(false)} />}
      {showVoucher && <VoucherPrint booking={booking} onClose={() => setShowVoucher(false)} />}
      {showVoucher2 && <Voucher2Print booking={booking} onClose={() => setShowVoucher2(false)} />}
    </div>
  );
};

export default BookingDetail;

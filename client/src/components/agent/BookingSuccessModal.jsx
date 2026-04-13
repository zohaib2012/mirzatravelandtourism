import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { paymentAPI } from "../../services/api";
import { FaCheckCircle, FaTimes, FaPrint } from "react-icons/fa";

const BookingSuccessModal = ({ booking, onClose }) => {
  const [bankAccounts, setBankAccounts] = useState([]);

  useEffect(() => {
    paymentAPI.getBankAccounts().then(({ data }) => setBankAccounts(data)).catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 text-center border-b">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-green-600">BOOKING SUCCESSFULLY MADE</h2>
          <p className="text-sm text-gray-500 mt-2">
            Your booking <b className="text-primary">{booking.bookingNo}</b> has been submitted.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Your reservation is on hold. Please complete the payment within the deadline to confirm.
          </p>
        </div>

        {/* Bank Details */}
        <div className="p-5">
          <h3 className="font-bold text-primary mb-3">Bank Details for Payment</h3>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left border">Bank Name</th>
                <th className="px-3 py-2 text-left border">Account Title</th>
                <th className="px-3 py-2 text-left border">Account #</th>
                <th className="px-3 py-2 text-left border">IBAN</th>
              </tr>
            </thead>
            <tbody>
              {bankAccounts.map((acc) => (
                <tr key={acc.id}>
                  <td className="px-3 py-2 border font-semibold">{acc.bankName}</td>
                  <td className="px-3 py-2 border">{acc.accountTitle}</td>
                  <td className="px-3 py-2 border">{acc.accountNumber}</td>
                  <td className="px-3 py-2 border text-xs">{acc.iban || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Demo Ticket Link */}
          <div className="mt-4 flex gap-3">
            <Link
              to={`/agent/bookings/${booking.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold"
            >
              <FaPrint /> View Booking Details
            </Link>
            <Link
              to="/agent/bookings"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold"
            >
              My Bookings
            </Link>
          </div>
        </div>

        {/* Close */}
        <div className="p-4 border-t text-center">
          <button onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;

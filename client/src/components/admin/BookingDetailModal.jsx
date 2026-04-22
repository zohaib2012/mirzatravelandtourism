import { useState, useEffect } from "react";
import { bookingAPI, uploadAPI } from "../../services/api";
import { FaTimes, FaSave, FaUpload, FaSpinner, FaPassport } from "react-icons/fa";
import { format } from "date-fns";
import toast from "react-hot-toast";

const statusColors = {
  ON_REQUEST: "bg-yellow-100 text-yellow-800",
  PARTIAL: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const BookingDetailModal = ({ bookingId, onClose, onStatusChange }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [passengers, setPassengers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [bookingId]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.getDetail(bookingId);
      setBooking(data);
      setPassengers(data.passengers.map((p) => ({ ...p, uploadingFront: false, uploadingBack: false, dob: p.dob ? p.dob.split("T")[0] : "", passportExpiry: p.passportExpiry ? p.passportExpiry.split("T")[0] : "" })));
    } catch {
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handlePassportUpload = async (index, side, file) => {
    if (!file) return;
    const uploadingKey = side === "front" ? "uploadingFront" : "uploadingBack";
    updatePassenger(index, uploadingKey, true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await uploadAPI.passport(formData);
      const urlKey = side === "front" ? "passportFrontUrl" : "passportBackUrl";
      const updated = [...passengers];
      updated[index] = { ...updated[index], [urlKey]: data.url, [uploadingKey]: false };
      setPassengers(updated);
      toast.success(`Passport ${side} uploaded`);
    } catch {
      updatePassenger(index, uploadingKey, false);
      toast.error("Upload failed");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await bookingAPI.updatePassengers(bookingId, {
        passengers: passengers.map((p) => ({
          title: p.title,
          name: p.name,
          surname: p.surname,
          type: p.type,
          dob: p.dob || null,
          passportNo: p.passportNo || null,
          passportExpiry: p.passportExpiry || null,
          passportFrontUrl: p.passportFrontUrl || null,
          passportBackUrl: p.passportBackUrl || null,
        })),
      });
      toast.success("Passenger details updated!");
      setEditing(false);
      load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-xl p-10 flex items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="text-gray-600">Loading booking details...</span>
      </div>
    </div>
  );

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary text-white px-5 py-4 flex items-center justify-between rounded-t-xl sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg">Booking Detail — {booking.bookingNo}</h3>
            <p className="text-xs text-blue-200 mt-1">
              {booking.agent?.agencyName} ({booking.agent?.agentCode}) &nbsp;|&nbsp;
              Created: {format(new Date(booking.createdAt), "dd MMM yyyy HH:mm")}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
            <FaTimes />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Booking Info Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Type</p>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${booking.bookingType === "PACKAGE" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>{booking.bookingType}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Status</p>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColors[booking.status]}`}>{booking.status.replace("_", " ")}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total Price</p>
              <p className="font-bold text-green-700">PKR {Number(booking.totalPrice).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Seats</p>
              <p className="font-bold">{booking.adultsCount}A + {booking.childrenCount}C + {booking.infantsCount}I = {booking.totalSeats}</p>
            </div>
          </div>

          {/* Flight / Package Info */}
          {booking.group && (
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-primary text-sm mb-2">Flight Group</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div><span className="text-gray-500">Airline:</span> <span className="font-medium">{booking.group.airline?.name}</span></div>
                <div><span className="text-gray-500">Sector:</span> <span className="font-medium">{booking.group.sector?.routeDisplay}</span></div>
                <div><span className="text-gray-500">Departure:</span> <span className="font-medium">{booking.group.departureDate ? format(new Date(booking.group.departureDate), "dd MMM yyyy") : "-"}</span></div>
                <div><span className="text-gray-500">Group:</span> <span className="font-medium">{booking.group.groupName}</span></div>
                {booking.group.pnr1 && <div><span className="text-gray-500">PNR:</span> <span className="font-medium">{booking.group.pnr1}</span></div>}
              </div>
            </div>
          )}

          {booking.package && (
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-primary text-sm mb-2">Umrah Package</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Package:</span> <span className="font-medium">{booking.package.packageName}</span></div>
                <div><span className="text-gray-500">Room Type:</span> <span className="font-medium">{booking.roomType}</span></div>
              </div>
            </div>
          )}

          {/* Passengers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-primary text-sm flex items-center gap-2"><FaPassport /> Passenger Details</h4>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button onClick={() => { setEditing(false); load(); }} className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:opacity-90 flex items-center gap-1 disabled:opacity-50">
                      {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Changes
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-xs bg-accent text-white rounded hover:opacity-90">Edit Passengers</button>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[900px]">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-2 py-2 text-left w-8">#</th>
                      <th className="px-2 py-2 text-left w-16">Title</th>
                      <th className="px-2 py-2 text-left">Given Name</th>
                      <th className="px-2 py-2 text-left">Sur Name</th>
                      <th className="px-2 py-2 text-left w-16">Type</th>
                      <th className="px-2 py-2 text-left w-24">Passport #</th>
                      <th className="px-2 py-2 text-left w-24">Date of Birth</th>
                      <th className="px-2 py-2 text-left w-24">Passport Expiry</th>
                      <th className="px-2 py-2 text-left w-28">Front</th>
                      <th className="px-2 py-2 text-left w-28">Back</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengers.map((p, i) => (
                      <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                        <td className="px-2 py-2 text-center text-gray-500">{i + 1}</td>
                        <td className="px-2 py-2">
                          {editing ? (
                            <select value={p.title || "Mr"} onChange={(e) => updatePassenger(i, "title", e.target.value)}
                              className="w-full px-1 py-1 border rounded text-xs outline-none">
                              <option>Mr</option><option>Mrs</option><option>Ms</option>
                            </select>
                          ) : <span>{p.title || "-"}</span>}
                        </td>
                        <td className="px-2 py-2">
                          {editing ? (
                            <input type="text" value={p.name} onChange={(e) => updatePassenger(i, "name", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs outline-none" />
                          ) : <span className="font-medium">{p.name}</span>}
                        </td>
                        <td className="px-2 py-2">
                          {editing ? (
                            <input type="text" value={p.surname || ""} onChange={(e) => updatePassenger(i, "surname", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs outline-none" />
                          ) : <span>{p.surname || "-"}</span>}
                        </td>
                        <td className="px-2 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-bold text-white ${p.type === "ADULT" ? "bg-blue-500" : p.type === "CHILD" ? "bg-green-500" : "bg-yellow-500"}`}>{p.type}</span>
                        </td>
                        <td className="px-2 py-2">
                          {editing ? (
                            <input type="text" value={p.passportNo || ""} onChange={(e) => updatePassenger(i, "passportNo", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs outline-none" />
                          ) : <span>{p.passportNo || "-"}</span>}
                        </td>
                        <td className="px-2 py-2">
                          {editing ? (
                            <input type="date" value={p.dob || ""} onChange={(e) => updatePassenger(i, "dob", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs outline-none" />
                          ) : <span>{p.dob ? format(new Date(p.dob), "dd MMM yyyy") : "-"}</span>}
                        </td>
                        <td className="px-2 py-2">
                          {editing ? (
                            <input type="date" value={p.passportExpiry || ""} onChange={(e) => updatePassenger(i, "passportExpiry", e.target.value)}
                              className="w-full px-2 py-1 border rounded text-xs outline-none" />
                          ) : <span>{p.passportExpiry ? format(new Date(p.passportExpiry), "dd MMM yyyy") : "-"}</span>}
                        </td>
                        <td className="px-2 py-2">
                          {p.passportFrontUrl ? (
                            <div className="flex items-center gap-1">
                              <a href={p.passportFrontUrl} target="_blank" rel="noreferrer">
                                <img src={p.passportFrontUrl} alt="front" className="w-12 h-8 object-cover rounded border cursor-pointer hover:opacity-80" />
                              </a>
                              {editing && <button onClick={() => updatePassenger(i, "passportFrontUrl", "")} className="text-red-400 text-xs">✕</button>}
                            </div>
                          ) : editing ? (
                            <label className="flex items-center gap-1 cursor-pointer text-xs text-primary border border-primary rounded px-2 py-1 hover:bg-blue-50">
                              {p.uploadingFront ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                              <span>{p.uploadingFront ? "..." : "Upload"}</span>
                              <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => handlePassportUpload(i, "front", e.target.files[0])} />
                            </label>
                          ) : <span className="text-gray-400 text-xs">No image</span>}
                        </td>
                        <td className="px-2 py-2">
                          {p.passportBackUrl ? (
                            <div className="flex items-center gap-1">
                              <a href={p.passportBackUrl} target="_blank" rel="noreferrer">
                                <img src={p.passportBackUrl} alt="back" className="w-12 h-8 object-cover rounded border cursor-pointer hover:opacity-80" />
                              </a>
                              {editing && <button onClick={() => updatePassenger(i, "passportBackUrl", "")} className="text-red-400 text-xs">✕</button>}
                            </div>
                          ) : editing ? (
                            <label className="flex items-center gap-1 cursor-pointer text-xs text-primary border border-primary rounded px-2 py-1 hover:bg-blue-50">
                              {p.uploadingBack ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                              <span>{p.uploadingBack ? "..." : "Upload"}</span>
                              <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => handlePassportUpload(i, "back", e.target.files[0])} />
                            </label>
                          ) : <span className="text-gray-400 text-xs">No image</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;

import { useState, useEffect } from "react";
import { bookingAPI } from "../../services/api";
import { uploadPassportDirect } from "../../utils/uploadPassport";
import { FaTimes, FaPlane, FaUpload, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const BookNowModal = ({ group, onClose, onSuccess }) => {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [passengers, setPassengers] = useState([{ title: "Mr", name: "", surname: "", type: "ADULT", dob: "", passportNo: "", passportExpiry: "", passportFrontUrl: "", passportBackUrl: "", uploadingFront: false, uploadingBack: false }]);
  const [submitting, setSubmitting] = useState(false);

  const adultPrice = Number(group.adultPrice) || 0;
  const childPrice = Number(group.childPrice) || 0;
  const infantPrice = Number(group.infantPrice) || 0;
  const totalSeats = adults + children;
  const totalPrice = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice);

  useEffect(() => {
    const rows = [];
    for (let i = 0; i < adults; i++) rows.push({ title: passengers[i]?.title || "Mr", name: passengers[i]?.name || "", surname: passengers[i]?.surname || "", type: "ADULT", dob: passengers[i]?.dob || "", passportNo: passengers[i]?.passportNo || "", passportExpiry: passengers[i]?.passportExpiry || "", passportFrontUrl: passengers[i]?.passportFrontUrl || "", passportBackUrl: passengers[i]?.passportBackUrl || "", uploadingFront: false, uploadingBack: false });
    for (let i = 0; i < children; i++) rows.push({ title: passengers[adults + i]?.title || "Mr", name: passengers[adults + i]?.name || "", surname: passengers[adults + i]?.surname || "", type: "CHILD", dob: passengers[adults + i]?.dob || "", passportNo: passengers[adults + i]?.passportNo || "", passportExpiry: passengers[adults + i]?.passportExpiry || "", passportFrontUrl: passengers[adults + i]?.passportFrontUrl || "", passportBackUrl: passengers[adults + i]?.passportBackUrl || "", uploadingFront: false, uploadingBack: false });
    for (let i = 0; i < infants; i++) rows.push({ title: passengers[adults + children + i]?.title || "Mr", name: passengers[adults + children + i]?.name || "", surname: passengers[adults + children + i]?.surname || "", type: "INFANT", dob: passengers[adults + children + i]?.dob || "", passportNo: passengers[adults + children + i]?.passportNo || "", passportExpiry: passengers[adults + children + i]?.passportExpiry || "", passportFrontUrl: passengers[adults + children + i]?.passportFrontUrl || "", passportBackUrl: passengers[adults + children + i]?.passportBackUrl || "", uploadingFront: false, uploadingBack: false });
    setPassengers(rows);
  }, [adults, children, infants]);

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handlePassportUpload = async (index, side, file) => {
    if (!file) return;
    const uploadingKey = side === "front" ? "uploadingFront" : "uploadingBack";
    const urlKey = side === "front" ? "passportFrontUrl" : "passportBackUrl";
    updatePassenger(index, uploadingKey, true);
    try {
      const url = await uploadPassportDirect(file);
      const updated = [...passengers];
      updated[index] = { ...updated[index], [urlKey]: url, [uploadingKey]: false };
      setPassengers(updated);
      toast.success(`Passport ${side} uploaded`);
    } catch {
      updatePassenger(index, uploadingKey, false);
      toast.error("Upload failed");
    }
  };

  const handleSubmit = async () => {
    if (totalSeats > group.availableSeats) return toast.error(`Only ${group.availableSeats} seats available`);
    if (totalSeats < 1) return toast.error("At least 1 passenger required");
    const emptyNames = passengers.filter((p) => !p.name.trim());
    if (emptyNames.length > 0) return toast.error("Please enter all passenger names");

    setSubmitting(true);
    try {
      const isPackage = group.bookingType === "PACKAGE";
      const payload = {
        bookingType: isPackage ? "PACKAGE" : "AIRLINE",
        adultsCount: adults,
        childrenCount: children,
        infantsCount: infants,
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
      };
      if (isPackage) { payload.packageId = group.packageId; payload.roomType = group.roomType; }
      else { payload.groupId = group.id; }
      const { data } = await bookingAPI.create(payload);
      toast.success("Booking created successfully!");
      onSuccess(data.booking);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary text-white px-5 py-4 flex items-center justify-between rounded-t-xl sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg">Book Seats</h3>
            <p className="text-xs text-blue-200 mt-1">
              {group.bookingType === "PACKAGE"
                ? <>Package: <b>{group.packageName}</b> | Room: <b>{group.roomType}</b></>
                : <>Group: <b>{group.groupName}</b> | Available: <b>{group.availableSeats}</b> | Sector: <b>{group.sector?.routeDisplay}</b></>
              }
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
            <FaTimes />
          </button>
        </div>

        <div className="p-5">
          {/* Passenger Counts + Pricing */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-3">Passengers</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Adults</label>
                  <input type="number" min="1" max={group.availableSeats} value={adults}
                    onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Children (under 12)</label>
                  <input type="number" min="0" value={children}
                    onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Infants (under 2)</label>
                  <input type="number" min="0" value={infants}
                    onChange={(e) => setInfants(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <div className="pt-2 border-t">
                  <label className="text-xs text-gray-500">Total Seats</label>
                  <input type="text" readOnly value={totalSeats}
                    className="w-full px-3 py-2 border rounded text-sm bg-gray-50 font-bold" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-3">Price / Seat</h4>
              <div className="space-y-3">
                <div className="px-3 py-2 bg-blue-50 rounded text-sm"><span className="text-gray-500">Adult:</span><span className="float-right font-bold">PKR {adultPrice.toLocaleString()}</span></div>
                <div className="px-3 py-2 bg-green-50 rounded text-sm"><span className="text-gray-500">Child:</span><span className="float-right font-bold">PKR {childPrice.toLocaleString()}</span></div>
                <div className="px-3 py-2 bg-yellow-50 rounded text-sm"><span className="text-gray-500">Infant:</span><span className="float-right font-bold">PKR {infantPrice.toLocaleString()}</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-3">Total Price</h4>
              <div className="space-y-3">
                <div className="px-3 py-2 bg-blue-50 rounded text-sm"><span className="text-gray-500">{adults} Adults:</span><span className="float-right font-bold">PKR {(adults * adultPrice).toLocaleString()}</span></div>
                <div className="px-3 py-2 bg-green-50 rounded text-sm"><span className="text-gray-500">{children} Children:</span><span className="float-right font-bold">PKR {(children * childPrice).toLocaleString()}</span></div>
                <div className="px-3 py-2 bg-yellow-50 rounded text-sm"><span className="text-gray-500">{infants} Infants:</span><span className="float-right font-bold">PKR {(infants * infantPrice).toLocaleString()}</span></div>
                <div className="px-3 py-3 bg-red-50 rounded border-2 border-red-200">
                  <span className="text-gray-700 font-bold">Total:</span>
                  <span className="float-right font-bold text-red-600 text-lg">PKR {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="border rounded-lg overflow-hidden mb-4">
            <div className="bg-gray-800 text-white px-4 py-2 text-sm font-bold">Passenger Details</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left w-8">#</th>
                    <th className="px-2 py-2 text-left w-16">Title</th>
                    <th className="px-2 py-2 text-left w-36">Given Name</th>
                    <th className="px-2 py-2 text-left w-36">Sur Name</th>
                    <th className="px-2 py-2 text-left w-20">Type</th>
                    <th className="px-2 py-2 text-left w-28">Passport #</th>
                    <th className="px-2 py-2 text-left w-28">Date of Birth</th>
                    <th className="px-2 py-2 text-left w-28">Passport Expiry</th>
                    <th className="px-2 py-2 text-left w-36">Passport Front</th>
                    <th className="px-2 py-2 text-left w-36">Passport Back</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((p, i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                      <td className="px-2 py-2 text-gray-500 text-center">{i + 1}</td>
                      <td className="px-2 py-2">
                        <select value={p.title} onChange={(e) => updatePassenger(i, "title", e.target.value)}
                          className="w-full px-1 py-1.5 border rounded text-xs focus:ring-1 focus:ring-accent outline-none">
                          <option>Mr</option>
                          <option>Mrs</option>
                          <option>Ms</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={p.name} onChange={(e) => updatePassenger(i, "name", e.target.value)}
                          placeholder={`${p.type} ${i + 1} - Given Name`}
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-accent outline-none" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={p.surname} onChange={(e) => updatePassenger(i, "surname", e.target.value)}
                          placeholder="Sur Name"
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-accent outline-none" />
                      </td>
                      <td className="px-2 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold text-white ${p.type === "ADULT" ? "bg-blue-500" : p.type === "CHILD" ? "bg-green-500" : "bg-yellow-500"}`}>{p.type}</span>
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={p.passportNo} onChange={(e) => updatePassenger(i, "passportNo", e.target.value)}
                          placeholder="AB1234567"
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-accent outline-none" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="date" value={p.dob} onChange={(e) => updatePassenger(i, "dob", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-accent outline-none" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="date" value={p.passportExpiry} onChange={(e) => updatePassenger(i, "passportExpiry", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 focus:ring-accent outline-none" />
                      </td>
                      <td className="px-2 py-2">
                        {p.passportFrontUrl ? (
                          <div className="flex items-center gap-1">
                            <a href={p.passportFrontUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 underline truncate max-w-[80px]">Uploaded</a>
                            <button onClick={() => updatePassenger(i, "passportFrontUrl", "")} className="text-red-400 text-xs">✕</button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-1 cursor-pointer text-xs text-primary border border-primary rounded px-2 py-1 hover:bg-blue-50">
                            {p.uploadingFront ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                            <span>{p.uploadingFront ? "..." : "Upload"}</span>
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => handlePassportUpload(i, "front", e.target.files[0])} />
                          </label>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        {p.passportBackUrl ? (
                          <div className="flex items-center gap-1">
                            <a href={p.passportBackUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 underline truncate max-w-[80px]">Uploaded</a>
                            <button onClick={() => updatePassenger(i, "passportBackUrl", "")} className="text-red-400 text-xs">✕</button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-1 cursor-pointer text-xs text-primary border border-primary rounded px-2 py-1 hover:bg-blue-50">
                            {p.uploadingBack ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                            <span>{p.uploadingBack ? "..." : "Upload"}</span>
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => handlePassportUpload(i, "back", e.target.files[0])} />
                          </label>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalSeats > group.availableSeats && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-sm text-red-700">
              You are trying to book {totalSeats} seats but only {group.availableSeats} are available.
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting || totalSeats > group.availableSeats}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50 flex items-center gap-2">
              {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Booking...</> : <><FaPlane /> Submit Booking</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookNowModal;

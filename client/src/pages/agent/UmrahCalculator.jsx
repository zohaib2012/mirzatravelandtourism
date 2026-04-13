import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { packageAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FaPlus, FaTrash, FaCalculator } from "react-icons/fa";

const UmrahCalculator = () => {
  const [visaTypes, setVisaTypes] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [adults, setAdults] = useState(1);
  const [infants, setInfants] = useState(0);
  const [selectedVisa, setSelectedVisa] = useState("");
  const [visaRates, setVisaRates] = useState({ adultRate: 0, childRate: 0, totalVisa: 0 });
  const [roomType, setRoomType] = useState("PRIVATE");

  // Hotel rows (dynamic)
  const [hotelRows, setHotelRows] = useState([
    { city: "MAKKAH", hotelId: "", rooms: 1, roomType: "", checkin: "", nights: 1, checkout: "" },
  ]);

  // Transport
  const [selectedTransport, setSelectedTransport] = useState("");
  const [transportRate, setTransportRate] = useState(0);

  useEffect(() => {
    Promise.all([
      packageAPI.getVisaTypes(),
      packageAPI.getHotels({}),
      packageAPI.getTransports(),
    ]).then(([v, h, t]) => {
      setVisaTypes(v.data || []);
      setHotels(h.data || []);
      setTransports(t.data || []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  // Visa change
  const handleVisaChange = (visaId) => {
    setSelectedVisa(visaId);
    const visa = visaTypes.find((v) => v.id === parseInt(visaId));
    if (visa) {
      const adultRate = Number(visa.adultSellRate) || 0;
      const childRate = Number(visa.childSellRate) || 0;
      const totalVisa = (adults * adultRate) + (infants * childRate);
      setVisaRates({ adultRate, childRate, totalVisa });
    } else {
      setVisaRates({ adultRate: 0, childRate: 0, totalVisa: 0 });
    }
  };

  useEffect(() => {
    if (selectedVisa) handleVisaChange(selectedVisa);
  }, [adults, infants]);

  // Add hotel row
  const addHotelRow = () => {
    setHotelRows([...hotelRows, { city: "MAKKAH", hotelId: "", rooms: 1, roomType: "", checkin: "", nights: 1, checkout: "" }]);
  };

  const removeHotelRow = (index) => {
    if (hotelRows.length <= 1) return;
    setHotelRows(hotelRows.filter((_, i) => i !== index));
  };

  const updateHotelRow = (index, field, value) => {
    const updated = [...hotelRows];
    updated[index] = { ...updated[index], [field]: value };

    // Auto calculate checkout
    if (field === "checkin" || field === "nights") {
      const checkin = field === "checkin" ? value : updated[index].checkin;
      const nights = field === "nights" ? parseInt(value) : parseInt(updated[index].nights);
      if (checkin && nights > 0) {
        const checkout = new Date(checkin);
        checkout.setDate(checkout.getDate() + nights);
        updated[index].checkout = checkout.toISOString().split("T")[0];
      }
    }
    setHotelRows(updated);
  };

  // Transport change
  const handleTransportChange = (tId) => {
    setSelectedTransport(tId);
    const t = transports.find((tr) => tr.id === parseInt(tId));
    setTransportRate(t ? Number(t.sellRate) || 0 : 0);
  };

  // Get hotels filtered by city
  const getHotelsByCity = (city) => hotels.filter((h) => h.city === city);

  // Calculate totals
  const totalVisaCost = visaRates.totalVisa;
  const totalHotelCost = hotelRows.reduce((sum, row) => {
    const hotel = hotels.find((h) => h.id === parseInt(row.hotelId));
    if (!hotel) return sum;
    const rate = Number(hotel.doubleRate) || 0; // Use double rate as default
    return sum + (rate * parseInt(row.nights || 0) * parseInt(row.rooms || 1));
  }, 0);
  const grandTotal = totalVisaCost + totalHotelCost + transportRate;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Umrah Calculator</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 text-white font-bold rounded-t-lg" style={{ background: "linear-gradient(135deg, #f99f24, #EDDE5D)" }}>
          <h3 className="text-primary">Build Your Umrah Package</h3>
        </div>

        <div className="p-5">
          {/* ═══ VISA SECTION ═══ */}
          <h3 className="font-bold text-primary mb-3 border-b pb-2">1. Visa Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <div>
              <label className="text-xs font-medium text-gray-600">No. of Adults</label>
              <input type="number" min="0" value={adults} onChange={(e) => setAdults(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">No. of Infants</label>
              <input type="number" min="0" value={infants} onChange={(e) => setInfants(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Visa Type</label>
              <select value={selectedVisa} onChange={(e) => handleVisaChange(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm">
                <option value="">Select Visa</option>
                {visaTypes.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.adultSellRate} {v.currency})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Adult Visa Rate</label>
              <input type="text" readOnly value={visaRates.adultRate} className="w-full px-3 py-2 border rounded text-sm bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Infant Visa Rate</label>
              <input type="text" readOnly value={visaRates.childRate} className="w-full px-3 py-2 border rounded text-sm bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Total Visa Cost</label>
              <input type="text" readOnly value={totalVisaCost} className="w-full px-3 py-2 border rounded text-sm bg-yellow-50 font-bold" />
            </div>
          </div>

          {/* ═══ ROOM TYPE ═══ */}
          <h3 className="font-bold text-primary mb-3 border-b pb-2">2. Room Type</h3>
          <div className="mb-6">
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)}
              className="px-3 py-2 border rounded text-sm w-48">
              <option value="PRIVATE">Private</option>
              <option value="SHARING">Sharing</option>
            </select>
          </div>

          {/* ═══ HOTEL SELECTION ═══ */}
          <h3 className="font-bold text-primary mb-3 border-b pb-2 flex items-center justify-between">
            3. Hotel Selection
            <button onClick={addHotelRow} className="text-xs px-3 py-1 bg-accent text-white rounded hover:bg-accent-dark flex items-center gap-1">
              <FaPlus /> Add City
            </button>
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-left w-[10%]">Plan</th>
                  <th className="px-2 py-2 text-left w-[12%]">City</th>
                  <th className="px-2 py-2 text-left w-[22%]">Hotel</th>
                  <th className="px-2 py-2 text-left w-[8%]">Rooms</th>
                  <th className="px-2 py-2 text-left w-[12%]">Check-in</th>
                  <th className="px-2 py-2 text-left w-[8%]">Nights</th>
                  <th className="px-2 py-2 text-left w-[12%]">Check-out</th>
                  <th className="px-2 py-2 w-[5%]"></th>
                </tr>
              </thead>
              <tbody>
                {hotelRows.map((row, i) => (
                  <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                    <td className="px-2 py-2 text-xs text-gray-500">City {i + 1}</td>
                    <td className="px-2 py-2">
                      <select value={row.city} onChange={(e) => updateHotelRow(i, "city", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded text-xs">
                        <option value="MAKKAH">MAKKAH</option>
                        <option value="MADINA">MADINA</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select value={row.hotelId} onChange={(e) => updateHotelRow(i, "hotelId", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded text-xs">
                        <option value="">Select Hotel</option>
                        {getHotelsByCity(row.city).map((h) => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" min="1" max="5" value={row.rooms}
                        onChange={(e) => updateHotelRow(i, "rooms", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded text-xs" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="date" value={row.checkin}
                        onChange={(e) => updateHotelRow(i, "checkin", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded text-xs" />
                    </td>
                    <td className="px-2 py-2">
                      <select value={row.nights} onChange={(e) => updateHotelRow(i, "nights", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded text-xs">
                        {Array.from({ length: 30 }, (_, n) => n + 1).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input type="date" value={row.checkout} readOnly
                        className="w-full px-2 py-1.5 border rounded text-xs bg-gray-50" />
                    </td>
                    <td className="px-2 py-2">
                      {hotelRows.length > 1 && (
                        <button onClick={() => removeHotelRow(i)} className="text-red-500 hover:text-red-700">
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ═══ TRANSPORT ═══ */}
          <h3 className="font-bold text-primary mb-3 border-b pb-2">4. Transport</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div>
              <label className="text-xs font-medium text-gray-600">Select Transport</label>
              <select value={selectedTransport} onChange={(e) => handleTransportChange(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm">
                <option value="">Select Vehicle</option>
                {transports.map((t) => (
                  <option key={t.id} value={t.id}>{t.vehicleType} - {t.route}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Transfer Rate</label>
              <input type="text" readOnly value={transportRate} className="w-full px-3 py-2 border rounded text-sm bg-gray-50" />
            </div>
          </div>

          {/* ═══ TOTAL ═══ */}
          <div className="bg-gradient-to-r from-primary to-deepblue rounded-lg p-5 text-white mb-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-blue-200">Visa Cost</p>
                <p className="text-xl font-bold">{totalVisaCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-blue-200">Hotel Cost</p>
                <p className="text-xl font-bold">{totalHotelCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-blue-200">Transport</p>
                <p className="text-xl font-bold">{transportRate.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 rounded-lg py-2">
                <p className="text-xs text-accent">Grand Total</p>
                <p className="text-2xl font-bold text-accent">{grandTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => toast.success("Package calculation saved!")}
            className="px-8 py-3 font-bold rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #f99f24, #EDDE5D)" }}
          >
            <FaCalculator className="inline mr-2" /> Proceed to results
          </button>
        </div>
      </div>
    </div>
  );
};

export default UmrahCalculator;

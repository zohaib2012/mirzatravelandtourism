import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { packageAPI } from "../../services/api";
import { FaPrint, FaStar } from "react-icons/fa";
import toast from "react-hot-toast";

const HotelRates = () => {
  const [searchParams] = useSearchParams();
  const [makkahHotels, setMakkahHotels] = useState([]);
  const [madinaHotels, setMadinaHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [makkahFilter, setMakkahFilter] = useState({ rating: "", distance: "", hotel: "" });
  const [madinaFilter, setMadinaFilter] = useState({ rating: "", distance: "", hotel: "" });

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const [mRes, dRes] = await Promise.all([
        packageAPI.getHotels({ city: "MAKKAH" }),
        packageAPI.getHotels({ city: "MADINA" }),
      ]);
      setMakkahHotels(mRes.data || []);
      setMadinaHotels(dRes.data || []);
    } catch {
      toast.error("Failed to load hotel rates");
    } finally {
      setLoading(false);
    }
  };

  const filterHotels = (hotels, filter) => {
    return hotels.filter((h) => {
      if (filter.rating && h.starRating !== parseInt(filter.rating)) return false;
      if (filter.distance && Number(h.distance) !== parseFloat(filter.distance)) return false;
      if (filter.hotel && h.id !== parseInt(filter.hotel)) return false;
      return true;
    });
  };

  const getUniqueDistances = (hotels) => [...new Set(hotels.map((h) => Number(h.distance)).filter(Boolean))].sort((a, b) => a - b);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Hotel Rates</h1>
        <button onClick={() => window.print()} className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 print:hidden flex items-center gap-2">
          <FaPrint /> Print Rates
        </button>
      </div>

      {/* ═══ MAKKAH HOTELS ═══ */}
      <HotelTable
        title="Makkah Hotel Rates"
        hotels={makkahHotels}
        filter={makkahFilter}
        setFilter={setMakkahFilter}
        filterHotels={filterHotels}
        getUniqueDistances={getUniqueDistances}
        borderColor="#F36E0C"
      />

      {/* ═══ MADINA HOTELS ═══ */}
      <HotelTable
        title="Madina Hotel Rates"
        hotels={madinaHotels}
        filter={madinaFilter}
        setFilter={setMadinaFilter}
        filterHotels={filterHotels}
        getUniqueDistances={getUniqueDistances}
        borderColor="#F36E0C"
      />
    </div>
  );
};

const HotelTable = ({ title, hotels, filter, setFilter, filterHotels, getUniqueDistances, borderColor }) => {
  const filtered = filterHotels(hotels, filter);

  return (
    <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden" style={{ borderTop: `4px solid ${borderColor}` }}>
      <div className="p-4">
        <h2 className="text-lg font-bold text-primary mb-4">{title}</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 print:hidden">
          <div>
            <label className="text-xs font-medium text-gray-600">Filter by Rating</label>
            <select value={filter.rating} onChange={(e) => setFilter({ ...filter, rating: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm">
              <option value="">All Ratings</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{"★".repeat(r)} ({r} Star)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Filter by Distance</label>
            <select value={filter.distance} onChange={(e) => setFilter({ ...filter, distance: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm">
              <option value="">All Distances</option>
              {getUniqueDistances(hotels).map((d) => (
                <option key={d} value={d}>{d}m</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Filter by Hotel</label>
            <select value={filter.hotel} onChange={(e) => setFilter({ ...filter, hotel: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm">
              <option value="">All Hotels</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-3 py-2 text-left" style={{ width: "20%" }}>Hotel</th>
                <th className="px-3 py-2 text-center" style={{ width: "10%" }}>Rating</th>
                <th className="px-3 py-2 text-center" style={{ width: "10%" }}>Distance</th>
                <th className="px-3 py-2 text-center" style={{ width: "12%" }}>Sharing</th>
                <th className="px-3 py-2 text-center" style={{ width: "12%" }}>Double</th>
                <th className="px-3 py-2 text-center" style={{ width: "12%" }}>Triple</th>
                <th className="px-3 py-2 text-center" style={{ width: "12%" }}>Quad</th>
                <th className="px-3 py-2 text-center" style={{ width: "12%" }}>Quint</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-400">No hotels found</td></tr>
              ) : filtered.map((h, i) => (
                <tr key={h.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="px-3 py-2 font-semibold">{h.name}</td>
                  <td className="px-3 py-2 text-center text-accent">
                    {h.starRating ? "★".repeat(h.starRating) : "-"}
                  </td>
                  <td className="px-3 py-2 text-center">{h.distance ? `${Number(h.distance)}m` : "-"}</td>
                  <td className="px-3 py-2 text-center">{h.sharingRate ? Number(h.sharingRate).toLocaleString() : "-"}</td>
                  <td className="px-3 py-2 text-center">{h.doubleRate ? Number(h.doubleRate).toLocaleString() : "-"}</td>
                  <td className="px-3 py-2 text-center">{h.tripleRate ? Number(h.tripleRate).toLocaleString() : "-"}</td>
                  <td className="px-3 py-2 text-center">{h.quadRate ? Number(h.quadRate).toLocaleString() : "-"}</td>
                  <td className="px-3 py-2 text-center">{h.quintRate ? Number(h.quintRate).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HotelRates;

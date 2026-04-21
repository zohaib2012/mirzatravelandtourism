import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { groupAPI, bookingAPI, paymentAPI } from "../../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FaPlane, FaCopy, FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import BookNowModal from "../../components/agent/BookNowModal";
import BookingSuccessModal from "../../components/agent/BookingSuccessModal";

const FlightGroups = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [groups, setGroups] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // Filters
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeAirline, setActiveAirline] = useState("");
  const [activeSector, setActiveSector] = useState("");

  // Modals
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);

  const categories = [
    { value: "", label: "All Types" },
    { value: "UMRAH", label: "Umrah" },
    { value: "UAE_ONE_WAY", label: "UAE One Way" },
    { value: "KSA_ONE_WAY", label: "KSA One Way" },
  ];

  useEffect(() => {
    loadGroups();
    loadFilters();
  }, [activeCategory, activeAirline, activeSector]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (activeAirline) params.airline = activeAirline;
      if (activeSector) params.sector = activeSector;
      if (searchText) params.search = searchText;

      const { data } = await groupAPI.getAll(params);
      setGroups(data.groups || []);
    } catch {
      toast.error("Failed to load flight groups");
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const params = {};
      if (activeCategory) params.category = activeCategory;
      const { data } = await groupAPI.getFilters(params);
      setAirlines(data.airlines || []);
      setSectors(data.sectors || []);
    } catch {}
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveAirline("");
    setActiveSector("");
    setSearchParams(cat ? { category: cat } : {});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadGroups();
  };

  const handleBookNow = (group) => {
    setSelectedGroup(group);
    setBookModalOpen(true);
  };

  const handleBookingSuccess = (booking) => {
    setBookModalOpen(false);
    setLastBooking(booking);
    setSuccessModalOpen(true);
    loadGroups(); // refresh seats
  };

  const copyFlightDetails = (group) => {
    const line = "─".repeat(35);
    let text = `✈ *MIRZA TRAVEL & TOURISM*\n${line}\n`;
    text += `*${group.airline?.name}* | ${group.sector?.routeDisplay}\n`;
    text += `📅 Departure: ${format(new Date(group.departureDate), "EEE, dd MMM yyyy")}\n`;
    text += `${line}\n*FLIGHT DETAILS:*\n`;
    group.flightLegs?.forEach((leg, i) => {
      text += `${i + 1}) *${leg.flightNumber}*  ${format(new Date(leg.departureDate), "ddMMM")}`;
      text += `  ${leg.origin} → ${leg.destination}`;
      if (leg.departureTime) text += `  Dep: ${leg.departureTime}`;
      if (leg.arrivalTime) text += `  Arr: ${leg.arrivalTime}`;
      if (leg.baggage) text += `  Baggage: ${leg.baggage}`;
      text += "\n";
    });
    text += `${line}\n`;
    text += `💺 Available Seats: *${group.availableSeats}*\n`;
    text += `💰 Adult Price: *PKR ${Number(group.adultPrice).toLocaleString()}*\n`;
    if (group.childPrice) text += `💰 Child Price: *PKR ${Number(group.childPrice).toLocaleString()}*\n`;
    if (group.infantPrice) text += `💰 Infant Price: *PKR ${Number(group.infantPrice).toLocaleString()}*\n`;
    text += `${line}\n📞 Helpline: +92 3000381533`;
    navigator.clipboard.writeText(text);
    toast.success("Flight details copied to clipboard!");
  };

  const removeAllFilters = () => {
    setActiveAirline("");
    setActiveSector("");
    setSearchText("");
  };

  // Filter groups by search text locally
  const filteredGroups = groups.filter((g) => {
    if (!searchText) return true;
    const s = searchText.toLowerCase();
    return (
      g.groupName?.toLowerCase().includes(s) ||
      g.airline?.name?.toLowerCase().includes(s) ||
      g.sector?.routeDisplay?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      {/* Category Tabs */}
      <div className="bg-[#3782C9] rounded-t-lg mb-0">
        <div className="flex flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-5 py-3 text-sm font-bold transition-all ${
                activeCategory === cat.value
                  ? "bg-gray-900 text-white"
                  : "text-white hover:bg-blue-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sector Quick Buttons */}
      {sectors.length > 0 && (
        <div className="bg-gray-100 px-4 py-2 flex flex-wrap gap-2 items-center border-b">
          <button
            onClick={() => setActiveSector("")}
            className={`px-3 py-1 text-xs rounded font-semibold ${!activeSector ? "bg-accent text-white" : "bg-white text-gray-700 border"}`}
          >
            All Sector
          </button>
          {sectors.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSector(s.id.toString())}
              className={`px-3 py-1 text-xs rounded font-semibold ${
                activeSector === s.id.toString() ? "bg-accent text-white" : "bg-white text-gray-700 border"
              }`}
            >
              {s.routeDisplay}
            </button>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b shadow-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">Airline Groups</h2>
          {(activeAirline || activeSector) && (
            <button onClick={removeAllFilters} className="text-xs text-red-500 hover:underline">
              Remove all filters
            </button>
          )}
        </div>
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search..."
            className="px-3 py-2 border rounded-l text-sm w-64 focus:ring-2 focus:ring-accent outline-none"
          />
          <button type="submit" className="px-3 py-2 bg-primary text-white rounded-r hover:bg-primary-dark">
            <FaSearch />
          </button>
        </form>
      </div>

      <div className="flex gap-4 mt-4">
        {/* Left Sidebar - Filters */}
        <div className="hidden lg:block w-1/5 shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
            <h3 className="font-bold text-primary text-sm mb-3 flex items-center gap-2">
              <FaFilter /> Refine search results
            </h3>

            {/* Airline Filter */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-600 mb-2 uppercase">Filter Airline Wise</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-accent">
                  <input type="radio" name="airline" checked={!activeAirline} onChange={() => setActiveAirline("")} className="text-accent" />
                  Show All
                </label>
                {airlines.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-xs cursor-pointer hover:text-accent">
                    <input type="radio" name="airline" checked={activeAirline === a.id.toString()}
                      onChange={() => setActiveAirline(a.id.toString())} className="text-accent" />
                    {a.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Sector Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-2 uppercase">Filter Sector Wise</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-accent">
                  <input type="radio" name="sector" checked={!activeSector} onChange={() => setActiveSector("")} className="text-accent" />
                  Show All
                </label>
                {sectors.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer hover:text-accent">
                    <input type="radio" name="sector" checked={activeSector === s.id.toString()}
                      onChange={() => setActiveSector(s.id.toString())} className="text-accent" />
                    {s.routeDisplay}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Flight Cards */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-400">
              <FaPlane className="text-5xl mx-auto mb-3 opacity-30" />
              <p className="text-lg">No flight groups available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <FlightCard
                  key={group.id}
                  group={group}
                  onBookNow={handleBookNow}
                  onCopy={copyFlightDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book Now Modal */}
      {bookModalOpen && selectedGroup && (
        <BookNowModal
          group={selectedGroup}
          onClose={() => setBookModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Booking Success Modal */}
      {successModalOpen && lastBooking && (
        <BookingSuccessModal
          booking={lastBooking}
          onClose={() => setSuccessModalOpen(false)}
        />
      )}
    </div>
  );
};

// ═══ Flight Card Component ═══
const FlightCard = ({ group, onBookNow, onCopy }) => {
  const getCategoryColor = (cat) => {
    if (cat === "UMRAH") return "bg-green-600";
    if (cat === "UAE_ONE_WAY") return "bg-blue-600";
    if (cat === "KSA_ONE_WAY") return "bg-purple-600";
    return "bg-gray-600";
  };

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-gray-800 text-white flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getCategoryColor(group.category)}`}>
            {group.category?.replace("_", " ")}
          </span>
          <span>{group.airline?.name}-{group.sector?.routeDisplay}</span>
          {group.numDays && <span>| {group.numDays} Days</span>}
          <span>| AG-{group.id}</span>
        </div>
        <button onClick={() => onCopy(group)} className="flex items-center gap-1 hover:text-accent" title="Copy details">
          <FaCopy /> Copy
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col lg:flex-row gap-4">
        {/* Airline Name */}
        <div className="lg:w-[15%] flex flex-col items-center justify-center">
          {group.airline?.logoUrl ? (
            <img src={group.airline.logoUrl} alt={group.airline?.name} className="w-14 h-14 object-contain rounded-full border-2 border-primary bg-white" />
          ) : (
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
              {group.airline?.name?.split(" ").map((w) => w[0]).join("").substring(0, 3)}
            </div>
          )}
          <span className="text-xs font-bold text-primary text-center mt-1">{group.airline?.name}</span>
        </div>

        {/* Flight Legs */}
        <div className="lg:w-[40%]">
          {group.flightLegs?.map((leg, i) => (
            <div key={leg.id} className="text-xs mb-1.5 flex items-start gap-1">
              <span className="font-bold text-accent">{i + 1})</span>
              <span>
                <b>{leg.flightNumber}</b>{" "}
                {format(new Date(leg.departureDate), "ddMMM").toUpperCase()}{" "}
                <b>{leg.origin}-{leg.destination}</b>{" "}
                {leg.departureTime || ""} {leg.arrivalTime ? `→ ${leg.arrivalTime}` : ""}{" "}
                <span className="text-gray-500">{leg.baggage}</span>
              </span>
            </div>
          ))}
          {(!group.flightLegs || group.flightLegs.length === 0) && (
            <p className="text-xs text-gray-400">Flight details pending</p>
          )}
        </div>

        {/* Seats */}
        <div className="lg:w-[15%] text-center">
          <p className="text-xs text-gray-500">Total Seats: {group.totalSeats}</p>
          <p className="text-lg font-bold text-primary">{group.availableSeats}</p>
          <p className="text-xs text-gray-500">Available</p>
        </div>

        {/* Departure Date */}
        <div className="lg:w-[12%] text-center">
          <p className="text-xs text-gray-500">Departure</p>
          <p className="text-sm font-bold text-gray-800">
            {format(new Date(group.departureDate), "EEE dd MMM yyyy")}
          </p>
        </div>

        {/* Price + Book Now */}
        <div className="lg:w-[18%] text-center flex flex-col items-center justify-center">
          {Number(group.adultPrice) > 0 ? (
            <>
              <p className="text-xs text-gray-500">From</p>
              <p className="text-xl font-bold text-green-600">
                PKR {Number(group.adultPrice).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-sm font-bold text-orange-500">PRICE ON CALL</p>
          )}
          <button
            onClick={() => onBookNow(group)}
            disabled={group.availableSeats <= 0}
            className="mt-2 px-6 py-2 bg-accent text-white font-bold rounded-lg hover:bg-accent-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {group.availableSeats > 0 ? "Book Now" : "Sold Out"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default FlightGroups;

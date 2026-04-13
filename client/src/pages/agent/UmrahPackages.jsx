import { useState, useEffect } from "react";
import { packageAPI } from "../../services/api";
import { format } from "date-fns";
import { FaPlane, FaPlaneDeparture, FaPlaneArrival, FaKaaba, FaMosque, FaBus, FaChair } from "react-icons/fa";
import toast from "react-hot-toast";
import BookNowModal from "../../components/agent/BookNowModal";
import BookingSuccessModal from "../../components/agent/BookingSuccessModal";

const UmrahPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [airlineFilters, setAirlineFilters] = useState([]);
  const [sectorFilters, setSectorFilters] = useState([]);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const { data } = await packageAPI.getAll({});
      setPackages(data.packages || []);

      // Extract unique airlines and sectors for filters
      const airSet = new Set();
      const secSet = new Set();
      (data.packages || []).forEach((p) => {
        if (p.group?.airline?.name) airSet.add(p.group.airline.name);
        if (p.group?.sector?.routeDisplay) secSet.add(p.group.sector.routeDisplay);
      });
      setAirlineFilters([...airSet]);
      setSectorFilters([...secSet]);
    } catch {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const toggleAirline = (a) => {
    setSelectedAirlines((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };
  const toggleSector = (s) => {
    setSelectedSectors((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const filteredPackages = packages.filter((p) => {
    if (selectedAirlines.length > 0 && !selectedAirlines.includes(p.group?.airline?.name)) return false;
    if (selectedSectors.length > 0 && !selectedSectors.includes(p.group?.sector?.routeDisplay)) return false;
    return true;
  });

  const handleBookingSuccess = (booking) => {
    setLastBooking(booking);
    setBookModalOpen(false);
    setSuccessModalOpen(true);
    loadPackages();
  };

  const selectPackage = (pkg, roomType, price) => {
    if (!price) return toast.error("This room type is not available");
    // Build a group-like object for the BookNowModal (package booking)
    const groupForModal = {
      ...pkg.group,
      id: pkg.group?.id,
      packageId: pkg.id,
      packageName: pkg.packageName,
      bookingType: "PACKAGE",
      roomType,
      adultPrice: price,
      childPrice: price,
      infantPrice: 0,
      availableSeats: 999,
      totalSeats: 999,
    };
    setSelectedGroup(groupForModal);
    setBookModalOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

  return (
    <div className="flex gap-4">
      {/* Left Sidebar Filters */}
      <div className="hidden lg:block w-[280px] shrink-0">
        <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-primary text-sm">Filters</h3>
            <button onClick={() => { setSelectedAirlines([]); setSelectedSectors([]); }}
              className="text-xs text-red-500 hover:underline">Reset All</button>
          </div>

          {airlineFilters.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-600 mb-2 uppercase">Airline</h4>
              {airlineFilters.map((a) => (
                <label key={a} className="flex items-center gap-2 text-xs mb-1 cursor-pointer">
                  <input type="checkbox" checked={selectedAirlines.includes(a)} onChange={() => toggleAirline(a)} />
                  {a}
                </label>
              ))}
            </div>
          )}

          {sectorFilters.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-600 mb-2 uppercase">Sector</h4>
              {sectorFilters.map((s) => (
                <label key={s} className="flex items-center gap-2 text-xs mb-1 cursor-pointer">
                  <input type="checkbox" checked={selectedSectors.includes(s)} onChange={() => toggleSector(s)} />
                  {s}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Package Cards */}
      <div className="flex-1 space-y-5">
        {filteredPackages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-400">
            <FaKaaba className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No Umrah packages available</p>
          </div>
        ) : filteredPackages.map((pkg, idx) => (
          <div key={pkg.id} className="rounded-xl overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}>
            <div className="p-5 text-white">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Package Number + Dates */}
                <div className="lg:w-[120px] flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl"
                    style={{ background: "linear-gradient(135deg, #f99f24, #EDDE5D)" }}>
                    {idx + 1}
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">UPV # {pkg.id}</span>
                  {pkg.departureDate && (
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded flex items-center gap-1">
                      <FaPlaneArrival className="text-[10px]" /> {format(new Date(pkg.departureDate), "dd MMM yy")}
                    </span>
                  )}
                  {pkg.returnDate && (
                    <span className="text-xs bg-green-500 px-2 py-1 rounded flex items-center gap-1">
                      <FaPlaneDeparture className="text-[10px]" /> {format(new Date(pkg.returnDate), "dd MMM yy")}
                    </span>
                  )}
                </div>

                {/* Package Details */}
                <div className="flex-1">
                  {/* Days + Seats */}
                  <div className="flex gap-4 mb-3">
                    {pkg.numDays && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">{pkg.numDays}</p>
                        <p className="text-xs text-blue-200">Days</p>
                      </div>
                    )}
                    {pkg.availableSeats && (
                      <div className="text-center flex items-center gap-1">
                        <FaChair className="text-accent" />
                        <span className="font-bold">{pkg.availableSeats}</span>
                        <span className="text-xs text-blue-200">Seats</span>
                      </div>
                    )}
                  </div>

                  {/* Flight Legs */}
                  {pkg.group?.flightLegs?.length > 0 && (
                    <div className="bg-white/10 rounded-lg p-3 mb-3">
                      {pkg.group.flightLegs.map((leg) => (
                        <div key={leg.id} className="flex items-center gap-3 text-xs mb-1">
                          <b>{leg.flightNumber}</b>
                          <span>{format(new Date(leg.departureDate), "dd MMM")}</span>
                          <b>{leg.origin}-{leg.destination}</b>
                          <span>{leg.departureTime} - {leg.arrivalTime}</span>
                          <span className="text-blue-200">{leg.baggage}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hotels */}
                  {pkg.packageHotels?.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {pkg.packageHotels.map((ph) => (
                        <div key={ph.id} className="flex items-center gap-2 text-xs bg-white/10 px-3 py-2 rounded-lg">
                          {ph.city === "MAKKAH" ? (
                            <FaKaaba className="text-accent" />
                          ) : (
                            <FaMosque className="text-green-400" />
                          )}
                          <div>
                            <p className="font-semibold">{ph.hotel?.name}</p>
                            <p className="text-blue-200">{ph.nights} Nights | {ph.hotel?.distance || 0}m from Haram</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Transport */}
                  {pkg.packageTransport && (
                    <div className="flex items-center gap-2 text-xs text-blue-200">
                      <FaBus /> Transport: PKR {Number(pkg.packageTransport.cost || 0).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Row */}
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/20 pt-4">
                {/* Airline Logo */}
                <div className="w-20">
                  {pkg.group?.airline?.logoUrl ? (
                    <img src={pkg.group.airline.logoUrl} alt="" className="h-8 object-contain" />
                  ) : (
                    <span className="text-xs font-bold">{pkg.group?.airline?.name}</span>
                  )}
                </div>

                {/* Price Boxes */}
                {[
                  { label: "Shared", price: pkg.sharedPrice },
                  { label: "Double", price: pkg.doublePrice },
                  { label: "Triple", price: pkg.triplePrice },
                  { label: "Quad", price: pkg.quadPrice },
                ].map(({ label, price }) => (
                  <button
                    key={label}
                    onClick={() => price && selectPackage(pkg, label.toLowerCase(), price)}
                    disabled={!price}
                    className={`flex-1 min-w-[120px] py-3 rounded-lg text-center font-bold transition-all ${
                      price
                        ? "bg-white text-primary hover:bg-accent hover:text-white cursor-pointer"
                        : "bg-white/20 text-white/50 cursor-not-allowed"
                    }`}
                  >
                    <p className="text-xs opacity-70">{label}</p>
                    <p className="text-sm">{price ? `${Number(price).toLocaleString()}/-` : "N/A"}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {bookModalOpen && selectedGroup && (
        <BookNowModal
          group={selectedGroup}
          onClose={() => setBookModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
      {successModalOpen && lastBooking && (
        <BookingSuccessModal
          booking={lastBooking}
          onClose={() => setSuccessModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UmrahPackages;

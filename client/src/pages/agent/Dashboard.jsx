import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { bookingAPI, paymentAPI, authAPI } from "../../services/api";
import { FaPlane, FaKaaba, FaCalculator, FaWallet, FaArrowRight } from "react-icons/fa";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState({ airline: 0, umrah: 0, calculator: 0, balance: 0, balanceType: "Cr" });
  const [profileForm, setProfileForm] = useState({
    contactPerson: "", phone: "", city: "", country: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadProfile();
  }, []);

  const loadStats = async () => {
    try {
      const [airlineRes, umrahRes, ledgerRes] = await Promise.all([
        bookingAPI.getMy({ bookingType: "AIRLINE" }),
        bookingAPI.getMy({ bookingType: "PACKAGE" }),
        paymentAPI.getLedger({}),
      ]);
      setStats({
        airline: airlineRes.data.total || 0,
        umrah: umrahRes.data.total || 0,
        calculator: 0,
        balance: Math.abs(ledgerRes.data.closingBalance || 0).toFixed(2),
        balanceType: ledgerRes.data.closingType || "Cr",
      });
    } catch {}
  };

  const loadProfile = async () => {
    try {
      const { data } = await authAPI.getProfile();
      setProfileForm({
        contactPerson: data.contactPerson || "",
        phone: data.phone || "",
        city: data.city || "",
        country: data.country || "",
      });
    } catch {}
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      setUser({ ...user, contactPerson: data.user.contactPerson });
      localStorage.setItem("user", JSON.stringify({ ...user, contactPerson: data.user.contactPerson }));
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: "One Way Groups", count: stats.airline, icon: FaPlane, color: "bg-info", link: "/agent/bookings?type=AIRLINE", label: "My One Way Group Bookings" },
    { title: "Umrah Groups", count: stats.umrah, icon: FaKaaba, color: "bg-success", link: "/agent/bookings?type=PACKAGE", label: "My Umrah Group Bookings" },
    { title: "Umrah Calculator", count: stats.calculator, icon: FaCalculator, color: "bg-warning", link: "/agent/calculator", label: "My Calculator Bookings" },
    { title: "Account", count: `${stats.balance} ${stats.balanceType}`, icon: FaWallet, color: "bg-danger", link: "/agent/ledger", label: "Closing Balance" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className={`${card.color} rounded-lg shadow-md text-white p-5`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm opacity-80">{card.title}</p>
                <p className="text-3xl font-bold">{card.count}</p>
              </div>
              <card.icon className="text-4xl opacity-30" />
            </div>
            <p className="text-xs opacity-80 mb-2">{card.label}</p>
            <Link to={card.link} className="flex items-center gap-1 text-xs font-semibold hover:underline">
              Go to list <FaArrowRight />
            </Link>
          </div>
        ))}
      </div>

      {/* Profile Update */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-primary">Update Your Profile</h2>
        </div>
        <form onSubmit={handleProfileUpdate} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
              <input type="text" value={user?.agencyName || ""} disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={user?.email || ""} disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name</label>
              <input type="text" value={profileForm.contactPerson}
                onChange={(e) => setProfileForm({ ...profileForm, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone No.</label>
              <input type="text" value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" value={profileForm.country}
                onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-danger text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50">
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;

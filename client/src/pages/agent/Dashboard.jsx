import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { bookingAPI, paymentAPI, authAPI } from "../../services/api";
import { FaPlane, FaKaaba, FaCalculator, FaWallet, FaArrowRight, FaUser, FaCalendarAlt, FaBox, FaCheck } from "react-icons/fa";
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
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: "One Way Groups", count: stats.airline, icon: FaPlane, color: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/30", link: "/agent/bookings?type=AIRLINE", label: "My One Way Group Bookings" },
    { title: "Umrah Groups", count: stats.umrah, icon: FaKaaba, color: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/30", link: "/agent/bookings?type=PACKAGE", label: "My Umrah Group Bookings" },
    { title: "Umrah Calculator", count: stats.calculator, icon: FaCalculator, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/30", link: "/agent/calculator", label: "My Calculator Bookings" },
    { title: "Account Balance", count: `${stats.balance} ${stats.balanceType}`, icon: FaWallet, color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/30", link: "/agent/ledger", label: "Closing Balance" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Welcome, {user?.contactPerson || user?.agencyName}!</h1>
          <p className="text-gray-500 text-sm mt-1">Here's your business overview.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <FaCalendarAlt className="text-accent" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`relative overflow-hidden bg-gradient-to-br ${card.color} rounded-2xl shadow-lg ${card.shadow} text-white p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group`}>
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium opacity-90">{card.title}</p>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <card.icon className="text-lg" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{card.count}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-80">
                <Link to={card.link} className="flex items-center gap-1 hover:underline">
                  <span>Go to list</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Update */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FaUser className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Update Your Profile</h2>
            <p className="text-xs text-gray-400">Keep your contact information up to date</p>
          </div>
        </div>
        <form onSubmit={handleProfileUpdate} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Agency Name</label>
              <input type="text" value={user?.agencyName || ""} disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={user?.email || ""} disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Contact Person Name</label>
              <input type="text" value={profileForm.contactPerson}
                onChange={(e) => setProfileForm({ ...profileForm, contactPerson: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Phone No.</label>
              <input type="text" value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input type="text" value={profileForm.country}
                onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FaCheck className="text-sm" />
                Update Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

const cities = [
  "Faisalabad", "Lahore", "Islamabad", "Karachi", "Rawalpindi", "Multan", "Gujranwala", "Peshawar",
  "Quetta", "Sialkot", "Bahawalpur", "Sargodha", "Sukkur", "Larkana", "Hyderabad", "Mardan",
  "Abbottabad", "Gujrat", "Sahiwal", "Jhang", "Rahim Yar Khan", "Sheikhupura", "Kasur",
  "Dera Ghazi Khan", "Mirpur Khas", "Nawabshah", "Muzaffarabad", "Gilgit", "Chitral",
  "Dubai", "Abu Dhabi", "Sharjah", "Riyadh", "Jeddah", "Makkah", "Madina", "Dammam",
  "Muscat", "Doha", "Kuwait City", "Manama", "Istanbul", "London", "Manchester", "Bangkok",
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    agencyName: "", contactPerson: "", email: "", phone: "",
    city: "", country: "Pakistan", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (form.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      toast.success(`Registration successful! Your Agent Code: ${data.agentCode}`);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-deepblue to-primary flex items-center justify-center px-4 py-24">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl animate-slideUp">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
            <FaUserPlus className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary font-poppins">Agent Registration</h1>
          <p className="text-sm text-gray-500">Register yourself at Pakistan's Travel Marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name *</label>
              <input type="text" name="agencyName" value={form.agencyName} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                placeholder="Your travel agency name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                placeholder="Contact person name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                placeholder="email@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                placeholder="+92 3XX XXXXXXX" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <select name="city" value={form.city} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none" required>
                <option value="">Select City</option>
                {cities.sort().map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" name="country" value={form.country} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none pr-10"
                placeholder="Min 8 characters" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                placeholder="Re-type password" required />
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            Password must be: at least 8 characters, 1 uppercase, 1 number, 1 special character (!, @, #, $, ^, &, *)
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-accent to-yellow-400 text-white font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? "Registering..." : "Register Now"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:text-accent">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaCog, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      if (data.user.role !== "ADMIN") {
        toast.error("Admin access only");
        return;
      }
      toast.success("Admin login successful!");
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary to-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-slideUp">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <FaCog className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary font-poppins">Admin Panel</h1>
          <p className="text-sm text-gray-500">Sign in to manage the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="admin@mirzatravel.pk" required />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type={showPassword ? "text" : "password"} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none pr-10"
              placeholder="Enter password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50">
            {loading ? "Logging in..." : "Login to Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

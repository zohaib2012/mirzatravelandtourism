import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaPlane, FaEye, FaEyeSlash, FaHeadset } from "react-icons/fa";
import ForgotPasswordModal from "../../components/common/ForgotPasswordModal";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({ agentCode: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      toast.success("Login successful!");
      navigate(data.user.role === "ADMIN" ? "/admin" : "/agent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-deepblue to-primary flex items-center justify-center px-4 pt-20">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-slideUp">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
            <FaPlane className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary font-poppins">Agent Login</h1>
          <p className="text-sm text-gray-500">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Code</label>
            <input type="text" value={form.agentCode} onChange={(e) => setForm({ ...form, agentCode: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              placeholder="Enter agent code" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              placeholder="Enter email" required />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none pr-10"
              placeholder="Enter password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-accent-dark transition-all disabled:opacity-50">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <p>Don't have an account? <Link to="/register" className="text-primary font-semibold hover:text-accent">Sign Up</Link></p>
          <p><button type="button" onClick={() => setForgotOpen(true)} className="text-primary hover:text-accent">Forgot Password? Click here</button></p>
        {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
          <p className="text-gray-500 flex items-center justify-center gap-2">
            <FaHeadset className="text-accent" /> Helpline: +92 3000381533
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

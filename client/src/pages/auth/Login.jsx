import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaKaaba, FaEye, FaEyeSlash, FaHeadset, FaCheckCircle,
  FaIdBadge, FaEnvelope, FaLock, FaArrowRight,
} from "react-icons/fa";
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

  const features = [
    "Real-time group flight inventory",
    "Exclusive Umrah packages & rates",
    "Instant booking confirmation",
    "24/7 dedicated agent support",
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* BG */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1200&q=80"
            alt="bg"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-deepblue/90 to-primary/95" />
        </div>
        {/* Pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

        {/* Content */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg">
              <FaKaaba className="text-primary text-xl" />
            </div>
            <div>
              <div className="text-white font-bold text-lg font-poppins leading-tight">MIRZA TRAVEL</div>
              <div className="text-accent text-[10px] font-semibold tracking-widest uppercase">& Tourism</div>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 text-accent text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <FaCheckCircle /> Agent Portal Access
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white font-poppins leading-snug">
              Welcome Back,<br />
              <span className="text-accent">Travel Agent!</span>
            </h2>
            <p className="text-white/60 text-sm mt-3 max-w-xs leading-relaxed">
              Sign in to manage your bookings, view group tickets, and access your complete travel dashboard.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-5 h-5 bg-accent/20 border border-accent/40 rounded-full flex items-center justify-center shrink-0">
                  <FaCheckCircle className="text-accent text-[9px]" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-white/40 text-xs">
          <FaHeadset className="text-accent" />
          Need help? Call <a href="tel:+923000381533" className="text-accent hover:underline">+92 300 038 1533</a>
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-gray-50 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <FaKaaba className="text-accent text-xl" />
              </div>
              <div>
                <div className="text-primary font-bold text-lg font-poppins">MIRZA TRAVEL</div>
                <div className="text-accent text-[10px] font-semibold tracking-widest uppercase">& Tourism</div>
              </div>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-poppins">Sign In</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your agent dashboard</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Agent Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Agent Code</label>
                <div className="relative">
                  <FaIdBadge className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={form.agentCode}
                    onChange={(e) => setForm({ ...form, agentCode: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    placeholder="e.g. MTA-001"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-primary hover:text-accent transition-colors font-medium">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-deepblue text-white font-bold rounded-xl text-sm hover:opacity-95 transition-all disabled:opacity-60 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>Sign In to Dashboard <FaArrowRight className="text-xs" /></>
                )}
              </button>
            </form>

            {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}

            <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-3">
              <p className="text-sm text-gray-600">
                New agent?{" "}
                <Link to="/register" className="text-primary font-bold hover:text-accent transition-colors">
                  Create an account
                </Link>
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                <FaHeadset className="text-accent" />
                Helpline: <a href="tel:+923000381533" className="text-primary font-semibold hover:text-accent transition-colors">+92 300 038 1533</a>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link to="/" className="hover:text-primary transition-colors">← Back to website</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

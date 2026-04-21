import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaKaaba, FaEye, FaEyeSlash, FaHeadset, FaCheckCircle,
  FaIdBadge, FaEnvelope, FaLock, FaArrowRight, FaPhone,
} from "react-icons/fa";
import ForgotPasswordModal from "../../components/common/ForgotPasswordModal";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";

const Login = () => {
  const { login, setUser } = useAuth();
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({ agentCode: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [tempEmail, setTempEmail] = useState("");

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const isAdminEmail = (email) => {
    return email && (email.includes("@mirzatravel.pk") || email === "zohaib.khaleed@gmail.com" || email === "admin@mirzatravel.pk");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isAdminEmail(form.email)) {
        setTempEmail(form.email);
        await authAPI.sendAdminOTP({ email: form.email, password: form.password });
        setOtpStep(true);
        setResendTimer(60);
        toast.success("OTP sent to admin email!");
      } else {
        const data = await login(form);
        toast.success("Login successful!");
        navigate(data.user.role === "ADMIN" ? "/admin" : "/agent");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    try {
      const { data } = await authAPI.verifyAdminOTP({ email: tempEmail, otp });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Login successful!");
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      await authAPI.resendAdminOTP({ email: tempEmail });
      setResendTimer(60);
      toast.success("OTP resent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleBack = () => {
    setOtpStep(false);
    setOtp("");
  };

  const features = [
    "Real-time group flight inventory",
    "Exclusive Umrah packages & rates",
    "Instant booking confirmation",
    "24/7 dedicated agent support",
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1200&q=80"
            alt="bg"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-deepblue/90 to-primary/95" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

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
          Need help? Call <a href="tel:+923000381533" className="text-accent hover:underline">03197810226</a>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-gray-50 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-poppins">
              {otpStep ? "Verify OTP" : "Sign In"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {otpStep 
                ? "Enter the 6-digit code sent to your email" 
                : "Enter your credentials to access your agent dashboard"
              }
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {otpStep ? (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaPhone className="text-primary text-2xl" />
                  </div>
                  <p className="text-sm text-gray-600">
                    OTP sent to <span className="font-semibold text-primary">{tempEmail}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enter 6-digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-xl font-bold tracking-[0.5em] focus:border-primary focus:outline-none transition-colors"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-deepblue text-white font-bold rounded-xl text-sm hover:opacity-95 transition-all disabled:opacity-60 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  {otpLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>Verify & Login <FaArrowRight className="text-xs" /></>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0}
                    className="text-sm text-primary hover:text-accent font-medium disabled:opacity-50">
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors">
                  ← Back to login
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    />
                  </div>
                </div>

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
            )}

            {!otpStep && forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}

            {!otpStep && (
              <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-3">
                <p className="text-sm text-gray-600">
                  New agent?{" "}
                  <Link to="/register" className="text-primary font-bold hover:text-accent transition-colors">
                    Create an account
                  </Link>
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                  <FaHeadset className="text-accent" />
                  Helpline: <a href="tel:+923000381533" className="text-primary font-semibold hover:text-accent transition-colors">03197810226</a>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            {otpStep ? (
              <span className="text-gray-500">OTP expires in 5 minutes</span>
            ) : (
              <Link to="/" className="hover:text-primary transition-colors">← Back to website</Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaShieldAlt, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowRight, FaKey } from "react-icons/fa";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api";

const AdminLogin = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.sendAdminOTP({ email: form.email, password: form.password });
      setTempEmail(form.email);
      setOtpStep(true);
      setResendTimer(60);
      toast.success("OTP sent to admin email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
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
      toast.success("Welcome, Admin!");
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left dark panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-[#030f1a] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-deepblue rounded-xl flex items-center justify-center shadow-lg border border-white/10">
            <FaShieldAlt className="text-accent text-xl" />
          </div>
          <div>
            <div className="text-white font-bold text-lg font-poppins">MIRZA TRAVEL</div>
            <div className="text-accent text-[10px] font-semibold tracking-widest uppercase">Admin Panel</div>
          </div>
        </div>

        <div className="relative z-10 space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <FaShieldAlt className="text-xs" /> Restricted Access
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white font-poppins leading-snug">
              Admin<br />
              <span className="text-accent">Control Center</span>
            </h2>
            <p className="text-white/50 text-sm mt-3 max-w-xs leading-relaxed">
              Secure administrative access to manage agents, bookings, payments, and platform settings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Agents", value: "Manage" },
              { label: "Bookings", value: "Monitor" },
              { label: "Payments", value: "Verify" },
              { label: "Reports", value: "Analytics" },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-accent text-xs font-bold">{item.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs">
          This area is restricted to authorized administrators only.
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-gray-50 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="flex lg:hidden justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <FaShieldAlt className="text-accent text-xl" />
              </div>
              <div>
                <div className="text-primary font-bold text-lg font-poppins">Admin Panel</div>
                <div className="text-gray-400 text-xs">Mirza Travel & Tourism</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-poppins">
              {otpStep ? "Verify OTP" : "Admin Sign In"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {otpStep
                ? "Enter the 6-digit code sent to your registered email"
                : "Enter your administrator credentials to continue"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {otpStep ? (
              /* ── OTP Verification Form ── */
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaKey className="text-primary text-2xl" />
                  </div>
                  <p className="text-sm text-gray-600">
                    OTP sent to{" "}
                    <span className="font-semibold text-primary">your registered email</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Check your inbox and enter the 6-digit code below</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enter 6-digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] focus:border-primary focus:outline-none transition-colors"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-[#030f1a] to-primary text-white font-bold rounded-xl text-sm hover:opacity-95 transition-all disabled:opacity-60 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  {otpLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <><FaShieldAlt /> Verify & Access Admin Panel <FaArrowRight className="text-xs" /></>
                  )}
                </button>

                <div className="text-center space-y-3">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0}
                    className="text-sm text-primary hover:text-accent font-medium disabled:opacity-50 transition-colors">
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>

                  <div>
                    <button
                      type="button"
                      onClick={() => { setOtpStep(false); setOtp(""); }}
                      className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                      ← Back to login
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* ── Login Form ── */
              <>
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl mb-6">
                  <FaShieldAlt className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-600 font-medium">Restricted area — authorized personnel only</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Email</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                        placeholder="admin@mirzatravel.pk"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
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
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#030f1a] to-primary text-white font-bold rounded-xl text-sm hover:opacity-95 transition-all disabled:opacity-60 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending OTP...
                      </>
                    ) : (
                      <><FaShieldAlt /> Access Admin Panel <FaArrowRight className="text-xs" /></>
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                  <Link to="/" className="text-sm text-gray-400 hover:text-primary transition-colors">
                    ← Back to main website
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            {otpStep ? (
              <span className="text-gray-500">OTP expires in 5 minutes</span>
            ) : (
              <>
                Agent login?{" "}
                <Link to="/login" className="text-primary hover:text-accent font-semibold transition-colors">Click here</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

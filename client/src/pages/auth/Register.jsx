import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import {
  FaKaaba, FaEye, FaEyeSlash, FaBuilding, FaUser, FaEnvelope,
  FaPhone, FaMapMarkerAlt, FaGlobe, FaLock, FaCheckCircle, FaArrowRight,
} from "react-icons/fa";
import toast from "react-hot-toast";

const cities = [
  "Faisalabad","Lahore","Islamabad","Karachi","Rawalpindi","Multan","Gujranwala",
  "Peshawar","Quetta","Sialkot","Bahawalpur","Sargodha","Sukkur","Hyderabad",
  "Mardan","Abbottabad","Gujrat","Sahiwal","Jhang","Rahim Yar Khan","Sheikhupura",
  "Kasur","Dera Ghazi Khan","Mirpur Khas","Nawabshah","Muzaffarabad","Gilgit",
  "Dubai","Abu Dhabi","Sharjah","Riyadh","Jeddah","Makkah","Madina","Dammam",
  "Muscat","Doha","Kuwait City","Manama","Istanbul","London","Bangkok",
];

const InputField = ({ icon: Icon, label, required, error, children, hint }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />}
      {children}
    </div>
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const inputCls = (icon) =>
  `w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors bg-gray-50 focus:bg-white`;

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    agencyName: "", contactPerson: "", email: "", phone: "",
    city: "", country: "Pakistan", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");

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

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-primary to-deepblue">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg">
            <FaKaaba className="text-primary text-xl" />
          </div>
          <div>
            <div className="text-white font-bold text-lg font-poppins">MIRZA TRAVEL</div>
            <div className="text-accent text-[10px] font-semibold tracking-widest uppercase">& Tourism</div>
          </div>
        </Link>

        <div className="relative z-10 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 text-accent text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              Join Our Network
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white font-poppins leading-snug">
              Become a<br />
              <span className="text-accent">Registered Agent</span>
            </h2>
            <p className="text-white/60 text-sm mt-3 max-w-xs leading-relaxed">
              Get exclusive access to group flight tickets, Umrah packages, and dedicated support for your travel business.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { title: "Free Registration", desc: "No signup fees — join in minutes" },
              { title: "Instant Access", desc: "Your agent code is generated immediately" },
              { title: "Best Rates", desc: "Wholesale rates exclusively for agents" },
              { title: "Full Dashboard", desc: "Manage bookings, payments & more" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent/20 border border-accent/30 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <FaCheckCircle className="text-accent text-xs" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-white/50 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline font-semibold">Sign in here</Link>
        </p>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-8 py-10 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-xl">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center">
                <FaKaaba className="text-accent text-lg" />
              </div>
              <div>
                <div className="text-primary font-bold text-base font-poppins">MIRZA TRAVEL</div>
                <div className="text-accent text-[9px] font-semibold tracking-widest uppercase">& Tourism</div>
              </div>
            </Link>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-poppins">Create Agent Account</h1>
            <p className="text-gray-500 text-sm mt-1">Fill in the details below to register as a travel agent</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Section: Agency Info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-md flex items-center justify-center text-[10px] font-bold">1</span>
                  Agency Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField icon={FaBuilding} label="Agency Name" required>
                    <input type="text" value={form.agencyName} onChange={set("agencyName")}
                      className={inputCls(true)} placeholder="Your travel agency name" required />
                  </InputField>
                  <InputField icon={FaUser} label="Contact Person" required>
                    <input type="text" value={form.contactPerson} onChange={set("contactPerson")}
                      className={inputCls(true)} placeholder="Full name" required />
                  </InputField>
                </div>
              </div>

              {/* Section: Contact */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-md flex items-center justify-center text-[10px] font-bold">2</span>
                  Contact Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField icon={FaEnvelope} label="Email Address" required>
                    <input type="email" value={form.email} onChange={set("email")}
                      className={inputCls(true)} placeholder="email@example.com" required />
                  </InputField>
                  <InputField icon={FaPhone} label="Phone Number" required>
                    <input type="text" value={form.phone} onChange={set("phone")}
                      className={inputCls(true)} placeholder="+92 3XX XXXXXXX" required />
                  </InputField>
                  <InputField icon={FaMapMarkerAlt} label="City" required>
                    <select value={form.city} onChange={set("city")}
                      className={inputCls(true)} required>
                      <option value="">Select City</option>
                      {cities.sort().map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </InputField>
                  <InputField icon={FaGlobe} label="Country">
                    <input type="text" value={form.country} onChange={set("country")}
                      className={inputCls(true)} placeholder="Pakistan" />
                  </InputField>
                </div>
              </div>

              {/* Section: Password */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-md flex items-center justify-center text-[10px] font-bold">3</span>
                  Set Password
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField icon={FaLock} label="Password" required>
                    <input type={showPassword ? "text" : "password"} value={form.password} onChange={set("password")}
                      className={`${inputCls(true)} pr-10`} placeholder="Min 8 characters" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </InputField>
                  <InputField icon={FaLock} label="Confirm Password" required>
                    <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={set("confirmPassword")}
                      className={`${inputCls(true)} pr-10`} placeholder="Re-type password" required />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </InputField>
                </div>
                <p className="text-xs text-gray-400 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  Must have: 8+ characters, 1 uppercase letter, 1 number, 1 special character (!, @, #, $)
                </p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-deepblue text-white font-bold rounded-xl text-sm hover:opacity-95 transition-all disabled:opacity-60 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>Create Agent Account <FaArrowRight className="text-xs" /></>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-bold hover:text-accent transition-colors">Sign In</Link>
              </p>
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

export default Register;

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { publicAPI } from "../../services/api";
import {
  FaPlane, FaKaaba, FaCalculator, FaBoxOpen, FaCheckCircle,
  FaHeadset, FaEye, FaEyeSlash, FaUsers, FaGlobe, FaStar,
  FaShieldAlt, FaClock, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaWhatsapp, FaArrowRight, FaBuilding, FaAward,
} from "react-icons/fa";
import ForgotPasswordModal from "../../components/common/ForgotPasswordModal";
import toast from "react-hot-toast";

const StatItem = ({ value, label, icon: Icon }) => (
  <div className="flex flex-col items-center text-center px-6 py-4">
    <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-2">
      <Icon className="text-accent text-xl" />
    </div>
    <div className="text-2xl font-bold text-white font-poppins">{value}</div>
    <div className="text-xs text-white/70 mt-0.5 uppercase tracking-wide">{label}</div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="flex gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group border border-gray-100">
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
      <Icon className="text-primary text-xl group-hover:text-white transition-colors" />
    </div>
    <div>
      <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Home = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [authorizations, setAuthorizations] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loginForm, setLoginForm] = useState({ agentCode: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(isAdmin ? "/admin" : "/agent");
  }, [isAuthenticated]);

  useEffect(() => {
    publicAPI.getBranches().then((r) => setBranches(r.data)).catch(() => {});
    publicAPI.getAuthorizations().then((r) => setAuthorizations(r.data)).catch(() => {});
    publicAPI.getDeals().then((r) => setDeals(r.data)).catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const data = await login(loginForm);
      toast.success("Login successful!");
      navigate(data.user.role === "ADMIN" ? "/admin" : "/agent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const services = [
    {
      title: "One Way Groups", icon: FaPlane, link: "/groups?category=UAE_ONE_WAY",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&q=80",
      desc: "Direct group flights at unbeatable rates",
      badge: "Popular",
    },
    {
      title: "Umrah Groups", icon: FaKaaba, link: "/groups?category=UMRAH",
      image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80",
      desc: "Blessed journeys with trusted arrangements",
      badge: "Most Booked",
    },
    {
      title: "Umrah Calculator", icon: FaCalculator, link: "/calculator",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
      desc: "Instantly calculate your Umrah package cost",
      badge: "Free Tool",
    },
    {
      title: "Umrah Packages", icon: FaBoxOpen, link: "/packages",
      image: "https://images.unsplash.com/photo-1564769625688-23d6f2df0892?w=600&q=80",
      desc: "All-inclusive packages for a seamless journey",
      badge: "New",
    },
  ];

  const features = [
    { icon: FaShieldAlt, title: "Trusted & Verified", desc: "Registered with IATA, PATA & Ministry of Tourism with years of excellence." },
    { icon: FaStar, title: "Best Rates Guaranteed", desc: "Get the most competitive airline group rates directly from the source." },
    { icon: FaClock, title: "Real-Time Inventory", desc: "Live seat availability updated instantly — book before they fill up." },
    { icon: FaHeadset, title: "24/7 Agent Support", desc: "Dedicated support team available around the clock for all your needs." },
    { icon: FaGlobe, title: "Nationwide Reach", desc: "Serving agents across all major cities in Pakistan with local presence." },
    { icon: FaAward, title: "Award-Winning Service", desc: "Recognized for outstanding service quality in travel industry." },
  ];

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1920&q=80"
            alt="Hero"
            className="w-full h-full object-cover object-center"
          />
          {/* Rich gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/30" />
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-primary/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
          {/* Left - Text */}
          <div className="animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 text-accent text-xs font-bold px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <FaStar className="text-accent" /> Pakistan's Most Trusted Travel Agency
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 font-poppins leading-tight">
              Your Journey<br />
              <span className="text-accent">Starts Here</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-xl leading-relaxed">
              Mirza Travel & Tourism offers exclusive airline group tickets, Umrah packages, and real-time inventory for registered travel agents across Pakistan.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "Real-time Airline Group Tickets Inventory",
                "Complete Umrah Packages — All Inclusive",
                "Easy to use Umrah Package Calculator",
                "24/7 Dedicated Support for Registered Agents",
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 bg-accent/20 border border-accent/50 rounded-full flex items-center justify-center shrink-0">
                    <FaCheckCircle className="text-accent text-xs" />
                  </div>
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a href="#services"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent text-primary font-bold rounded-xl hover:bg-accent/90 transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm">
                Explore Services <FaArrowRight />
              </a>
              <a href="https://wa.me/923000381533" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm backdrop-blur-sm">
                <FaWhatsapp className="text-[#25D366]" /> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Right - Login Card */}
          <div className="animate-slideUp">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto lg:ml-auto">
              {/* Card header */}
              <div className="bg-gradient-to-r from-primary to-deepblue px-8 py-5">
                <h2 className="text-xl font-bold text-white font-poppins">Agent Portal Login</h2>
                <p className="text-white/70 text-sm mt-1">Sign in to access your dashboard</p>
              </div>

              <div className="p-8">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Agent Code</label>
                    <input
                      type="text"
                      value={loginForm.agentCode}
                      onChange={(e) => setLoginForm({ ...loginForm, agentCode: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary outline-none transition-colors text-sm"
                      placeholder="e.g. MTA-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary outline-none transition-colors text-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary outline-none transition-colors text-sm pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[42px] text-gray-400 hover:text-primary transition-colors">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-deepblue text-white font-bold rounded-xl hover:opacity-95 transition-all disabled:opacity-60 shadow-md hover:shadow-lg text-sm mt-2">
                    {loginLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Logging in...
                      </span>
                    ) : "Sign In to Dashboard"}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5 text-center text-sm">
                  <p className="text-gray-600">
                    New agent?{" "}
                    <Link to="/register" className="text-primary font-semibold hover:text-accent transition-colors">
                      Register your account
                    </Link>
                  </p>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-gray-500 hover:text-primary text-sm transition-colors">
                    Forgot password?
                  </button>
                  {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-xs pt-1">
                    <FaHeadset className="text-accent text-sm" />
                    Helpline: <a href="tel:+923000381533" className="font-semibold text-primary hover:text-accent">+92 300 038 1533</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="bg-gradient-to-r from-primary to-deepblue">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            <StatItem value="15+" label="Years of Experience" icon={FaAward} />
            <StatItem value="500+" label="Registered Agents" icon={FaUsers} />
            <StatItem value="50k+" label="Happy Travelers" icon={FaStar} />
            <StatItem value="20+" label="Destinations" icon={FaGlobe} />
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-accent text-xs font-bold uppercase tracking-widest">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-poppins mt-2">Our Services</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Exclusive services designed for professional travel agents — real-time inventory, best rates, seamless booking</p>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <Link
                key={i}
                to={service.link}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 bg-white">
                {/* Badge */}
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-accent text-primary text-[10px] font-bold rounded-full shadow">
                  {service.badge}
                </div>
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                </div>
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="w-10 h-10 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm">
                    <service.icon className="text-accent text-lg" />
                  </div>
                  <h3 className="text-base font-bold mb-1">{service.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed">{service.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-accent text-xs font-bold group-hover:gap-2 transition-all">
                    Learn more <FaArrowRight className="text-[10px]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE US ═══ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <span className="text-accent text-xs font-bold uppercase tracking-widest">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary font-poppins mt-2 mb-4">Pakistan's Premier Travel Agency Platform</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                With over 15 years of experience, Mirza Travel & Tourism has established itself as a trusted partner for travel agents across Pakistan. Our digital platform gives you real-time access to group tickets and Umrah packages.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((f, i) => (
                  <FeatureCard key={i} {...f} />
                ))}
              </div>
            </div>

            {/* Right - Image stack */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80"
                  alt="Makkah"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                    <FaKaaba className="text-accent text-2xl" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary font-poppins">50k+</div>
                    <div className="text-xs text-gray-500">Umrah Pilgrims Served</div>
                  </div>
                </div>
              </div>
              {/* Top right floating badge */}
              <div className="absolute -top-4 -right-4 bg-accent rounded-2xl shadow-xl p-4">
                <FaAward className="text-primary text-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DEALS ═══ */}
      {deals.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-accent text-xs font-bold uppercase tracking-widest">Limited Time</span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary font-poppins mt-2">Special Deals</h2>
              <p className="text-gray-500 mt-3">Grab these exclusive offers before they expire</p>
              <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <div key={deal.id} className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100">
                  {deal.imageUrl && (
                    <div className="overflow-hidden">
                      <img src={deal.imageUrl} alt={deal.title} className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full mb-3">Special Offer</div>
                    <h3 className="text-lg font-bold text-primary mb-2">{deal.title}</h3>
                    <div className="w-10 h-0.5 bg-accent mb-3 rounded-full" />
                    <p className="text-sm text-gray-600 leading-relaxed">{deal.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-primary text-sm font-bold group-hover:text-accent transition-colors">
                      View Details <FaArrowRight className="text-xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ OFFICES ═══ */}
      {branches.length > 0 && (
        <section className="py-20 bg-white" id="about">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-accent text-xs font-bold uppercase tracking-widest">Find Us Near You</span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary font-poppins mt-2">Our Offices</h2>
              <p className="text-gray-500 mt-3">Branch network across Pakistan — serving agents nationwide</p>
              <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {branches.map((branch) => (
                <div key={branch.id} className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
                  <div className="h-36 bg-gradient-to-br from-primary to-deepblue flex items-center justify-center relative overflow-hidden">
                    {branch.imageUrl ? (
                      <img src={branch.imageUrl} alt={branch.city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <>
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                        <div className="text-center relative z-10">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FaBuilding className="text-accent text-xl" />
                          </div>
                          <span className="text-2xl font-bold text-accent font-poppins">{branch.city[0]}</span>
                        </div>
                      </>
                    )}
                    {branch.isHead && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-accent text-primary text-[9px] font-bold rounded-full">HQ</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-primary text-sm">{branch.city} {branch.isHead ? "(Head Office)" : "Office"}</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{branch.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CTA BANNER ═══ */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-primary to-deepblue">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: "40px 40px" }} />
        <div className="absolute right-0 top-0 w-96 h-96 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <FaKaaba className="text-accent text-4xl mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold text-white font-poppins mb-4">Ready to Grow Your Travel Business?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of travel agents who trust Mirza Travel & Tourism for reliable group bookings and Umrah arrangements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register"
              className="px-8 py-3.5 bg-accent text-primary font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl text-sm">
              Register as Agent
            </Link>
            <a href="https://wa.me/923000381533" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm backdrop-blur-sm">
              <FaWhatsapp className="text-[#25D366] text-lg" /> Contact on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ═══ AUTHORIZATIONS ═══ */}
      {authorizations.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="text-accent text-xs font-bold uppercase tracking-widest">Our Credentials</span>
              <h2 className="text-2xl md:text-3xl font-bold text-primary font-poppins mt-2">Authorized & Affiliated</h2>
              <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {authorizations.map((auth) => (
                <div key={auth.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 text-center border border-gray-100 hover:-translate-y-1">
                  {auth.logoUrl ? (
                    <img src={auth.logoUrl} alt={auth.name} className="w-20 h-16 mx-auto mb-3 object-contain" />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FaShieldAlt className="text-primary text-2xl" />
                    </div>
                  )}
                  <h4 className="font-bold text-primary text-xs">{auth.name}</h4>
                  {auth.description && <p className="text-[10px] text-gray-500 mt-1">{auth.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

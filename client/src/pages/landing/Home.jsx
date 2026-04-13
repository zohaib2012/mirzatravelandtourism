import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { publicAPI } from "../../services/api";
import { FaPlane, FaKaaba, FaCalculator, FaBoxOpen, FaCheckCircle, FaHeadset, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

const Home = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [authorizations, setAuthorizations] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loginForm, setLoginForm] = useState({ agentCode: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/admin" : "/agent");
    }
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
    { title: "One Way Groups", icon: FaPlane, color: "from-blue-500 to-blue-700", link: "/groups?category=UAE_ONE_WAY", image: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400" },
    { title: "Umrah Groups", icon: FaKaaba, color: "from-green-500 to-green-700", link: "/groups?category=UMRAH", image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400" },
    { title: "Umrah Calculator", icon: FaCalculator, color: "from-yellow-500 to-orange-600", link: "/calculator", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400" },
    { title: "Umrah Packages", icon: FaBoxOpen, color: "from-purple-500 to-purple-700", link: "/packages", image: "https://images.unsplash.com/photo-1564769625688-23d6f2df0892?w=400" },
  ];

  return (
    <div>
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[85vh] flex items-center bg-primary overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=1600" alt="" className="w-full h-full object-cover" />
          <div className="hero-overlay" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left - Text */}
          <div className="hidden lg:block animate-fadeIn">
            <h1 className="text-5xl font-bold text-white mb-4 font-poppins leading-tight">
              MIRZA TRAVEL<br /><span className="text-accent">& TOURISM</span>
            </h1>
            <ul className="space-y-3 mb-8">
              {[
                "Real-time Airline Group Tickets Inventory",
                "Complete Umrah Packages Hassle-Free",
                "Easy to use Umrah Package Calculator",
                "24/7 Support for Registered Agents",
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-white text-lg">
                  <FaCheckCircle className="text-accent shrink-0" /> {text}
                </li>
              ))}
            </ul>
            <a href="#services" className="inline-block px-8 py-3 bg-accent text-primary font-bold rounded-full hover:bg-accent-dark transition-all hover:-translate-y-1 shadow-lg">
              Get Started
            </a>
          </div>

          {/* Right - Login Form */}
          <div className="animate-slideUp">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto lg:ml-auto">
              <h2 className="text-xl font-bold text-primary mb-1 font-poppins">Agent Login</h2>
              <p className="text-sm text-gray-500 mb-6">Sign in to access your dashboard</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agent Code</label>
                  <input type="text" value={loginForm.agentCode} onChange={(e) => setLoginForm({ ...loginForm, agentCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                    placeholder="Enter your agent code" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                    placeholder="Enter your email" required />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type={showPassword ? "text" : "password"} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none pr-10"
                    placeholder="Enter your password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <button type="submit" disabled={loginLoading}
                  className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-accent-dark transition-all disabled:opacity-50">
                  {loginLoading ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="mt-4 space-y-2 text-center text-sm">
                <p className="text-gray-600">
                  Don't have an account? <Link to="/register" className="text-primary font-semibold hover:text-accent">Sign Up</Link>
                </p>
                <p>
                  <button className="text-primary hover:text-accent text-sm">Forgot Password? Click here</button>
                </p>
                <p className="text-gray-500 flex items-center justify-center gap-2">
                  <FaHeadset className="text-accent" /> Helpline: +92 3000381533
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES SECTION ═══ */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary font-poppins">OUR SERVICES</h2>
            <p className="text-gray-500 mt-2">EXCLUSIVE SERVICES WE OFFER TO TRAVEL AGENTS</p>
            <div className="w-20 h-1 bg-accent mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <Link key={i} to={service.link}
                className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-60 group-hover:opacity-70 transition-opacity`} />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <service.icon className="text-2xl mb-2" />
                  <h3 className="text-lg font-bold">{service.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DEALS SECTION ═══ */}
      {deals.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary font-poppins">CHECK OUR DEALS</h2>
              <div className="w-20 h-1 bg-accent mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {deal.imageUrl && <img src={deal.imageUrl} alt={deal.title} className="w-full h-48 object-cover" />}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-primary">{deal.title}</h3>
                    <div className="w-12 h-0.5 bg-accent my-2" />
                    <p className="text-sm text-gray-600">{deal.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ OFFICES SECTION ═══ */}
      {branches.length > 0 && (
        <section className="py-16 bg-gray-50" id="about">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary font-poppins">OUR OFFICES</h2>
              <p className="text-gray-500 mt-2">Our Branches Across Pakistan</p>
              <div className="w-20 h-1 bg-accent mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {branches.map((branch) => (
                <div key={branch.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="h-32 bg-gradient-to-br from-primary to-deepblue flex items-center justify-center">
                    {branch.imageUrl ? (
                      <img src={branch.imageUrl} alt={branch.city} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-accent">{branch.city[0]}</span>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="font-bold text-primary text-sm">{branch.isHead ? `${branch.city} (Head Office)` : `${branch.city} Office`}</h4>
                    <p className="text-xs text-gray-500 mt-1">{branch.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ AUTHORIZATIONS SECTION ═══ */}
      {authorizations.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary font-poppins">AUTHORIZED FROM</h2>
              <p className="text-gray-500 mt-2">Our Authorizations & Affiliations</p>
              <div className="w-20 h-1 bg-accent mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {authorizations.map((auth) => (
                <div key={auth.id} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                  {auth.logoUrl ? (
                    <img src={auth.logoUrl} alt={auth.name} className="w-20 h-20 mx-auto mb-3 object-contain" />
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-3xl text-accent" />
                    </div>
                  )}
                  <h4 className="font-bold text-primary text-sm">{auth.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{auth.description}</p>
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

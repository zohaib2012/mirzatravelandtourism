import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaBars, FaTimes, FaWhatsapp, FaChevronDown, FaTachometerAlt, FaKey, FaSignOutAlt, FaPlane, FaKaaba, FaCalculator, FaHotel } from "react-icons/fa";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAgent, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const products = [
    // { label: "One Way Groups", to: "/groups?category=UAE_ONE_WAY", icon: FaPlane },
    // { label: "Umrah Groups", to: "/groups?category=UMRAH", icon: FaKaaba },
    // { label: "Umrah Calculator", to: "/calculator", icon: FaCalculator },
    // { label: "Makkah Hotels", to: "/hotel-rates/makkah", icon: FaHotel },
    // { label: "Madina Hotels", to: "/hotel-rates/madina", icon: FaHotel },
       { label: "One Way Groups", to: "/", icon: FaPlane },
    { label: "Umrah Groups", to: "/", icon: FaKaaba },
    { label: "Umrah Calculator", to: "/", icon: FaCalculator },
    { label: "Makkah Hotels", to: "/", icon: FaHotel },
    { label: "Madina Hotels", to: "/", icon: FaHotel },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="hidden lg:block bg-primary text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="opacity-80">Welcome to Mirza Travel & Tourism — Pakistan's Premier Travel Agency</span>
          <div className="flex items-center gap-4 opacity-90">
            <a href="tel:+923000381533" className="hover:text-accent transition-colors">+92 300 038 1533</a>
            <span className="text-white/40">|</span>
            <a href="mailto:support@mirzatravel.pk" className="hover:text-accent transition-colors">support@mirzatravel.pk</a>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
            : "bg-white shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <FaKaaba className="text-accent text-lg" />
            </div>
            <div>
              <div className="text-primary font-bold text-lg leading-tight font-poppins tracking-wide">MIRZA TRAVEL</div>
              <div className="text-accent text-[10px] font-semibold tracking-widest uppercase leading-tight">&amp; Tourism</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:text-primary hover:bg-primary/5 transition-all">
              Home
            </Link>

            {/* Products Dropdown */}
            <div className="relative" onMouseEnter={() => setProductsOpen(true)} onMouseLeave={() => setProductsOpen(false)}>
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:text-primary hover:bg-primary/5 transition-all">
                Our Products <FaChevronDown className={`text-[10px] transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`} />
              </button>
              {productsOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white shadow-2xl rounded-xl py-2 min-w-[220px] border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Our Services</p>
                  </div>
                  {products.map(({ label, to, icon: Icon }) => (
                    <Link key={to} to={to}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-all"
                      onClick={() => setProductsOpen(false)}>
                      <Icon className="text-accent text-base shrink-0" /> {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <a href="#about" className="px-3 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:text-primary hover:bg-primary/5 transition-all">About</a>
            <a href="#contact" className="px-3 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:text-primary hover:bg-primary/5 transition-all">Contact</a>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* WhatsApp */}
            <a href="https://wa.me/923000381533" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#1ebe5d] transition-all shadow-sm hover:shadow-md">
              <FaWhatsapp className="text-base" /> WhatsApp
            </a>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-primary/5 transition-all">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-deepblue rounded-full flex items-center justify-center text-accent text-sm font-bold shadow">
                    {user?.contactPerson?.[0] || "U"}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.contactPerson?.split(" ")[0]}</span>
                  <FaChevronDown className="text-[10px]" />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white shadow-2xl rounded-xl py-2 min-w-[200px] border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs font-bold text-gray-700">{user?.contactPerson}</p>
                      <p className="text-[10px] text-gray-400">{user?.email}</p>
                    </div>
                    <Link to={isAdmin ? "/admin" : "/agent"} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-all" onClick={() => setUserMenuOpen(false)}>
                      <FaTachometerAlt className="text-primary" /> {isAdmin ? "Admin" : "Agent"} Dashboard
                    </Link>
                    {!isAdmin && (
                      <Link to="/agent/change-password" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-all" onClick={() => setUserMenuOpen(false)}>
                        <FaKey className="text-primary" /> Change Password
                      </Link>
                    )}
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all w-full text-left">
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all">
                  Register
                </Link>
                <Link to="/login"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-accent text-primary hover:bg-accent/90 transition-all shadow-sm">
                  Login
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-primary text-xl">
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="p-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
              <Link to="/" className="flex items-center gap-2 px-4 py-3 rounded-lg text-primary font-semibold hover:bg-primary/5" onClick={() => setMobileOpen(false)}>Home</Link>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Our Products</div>
              {products.map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-primary/5 hover:text-primary" onClick={() => setMobileOpen(false)}>
                  <Icon className="text-accent" /> {label}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-2" />
              <a href="https://wa.me/923000381533" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-[#25D366] font-semibold hover:bg-green-50">
                <FaWhatsapp className="text-lg" /> Chat on WhatsApp
              </a>
              <div className="border-t border-gray-100 my-2" />
              {isAuthenticated ? (
                <>
                  <Link to={isAdmin ? "/admin" : "/agent"} className="px-4 py-3 rounded-lg text-primary font-semibold hover:bg-primary/5" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <button onClick={handleLogout} className="px-4 py-3 rounded-lg text-red-500 font-semibold text-left hover:bg-red-50">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/register" className="px-4 py-3 rounded-lg border-2 border-primary text-primary font-semibold text-center hover:bg-primary hover:text-white transition-all" onClick={() => setMobileOpen(false)}>Register Now</Link>
                  <Link to="/login" className="px-4 py-3 rounded-lg bg-accent text-primary font-semibold text-center hover:bg-accent/90 transition-all" onClick={() => setMobileOpen(false)}>Login Now</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;

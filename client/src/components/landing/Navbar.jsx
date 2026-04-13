import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaBars, FaTimes, FaWhatsapp, FaChevronDown, FaUser, FaTachometerAlt, FaKey, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAgent, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-accent shadow-lg" : "bg-white shadow-md"}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className={`px-3 py-1.5 rounded-lg font-bold text-xl ${scrolled ? "bg-white text-primary" : "bg-primary text-white"}`}>
            MIRZA TRAVEL
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link to="/" className={`px-3 py-2 text-sm font-semibold rounded hover:text-accent ${scrolled ? "text-white hover:text-primary" : "text-primary"}`}>
            Home
          </Link>

          {/* Products Dropdown */}
          <div className="relative" onMouseEnter={() => setProductsOpen(true)} onMouseLeave={() => setProductsOpen(false)}>
            <button className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded ${scrolled ? "text-white" : "text-primary"}`}>
              Our Products <FaChevronDown className="text-xs" />
            </button>
            {productsOpen && (
              <div className="absolute top-full left-0 bg-white shadow-xl rounded-lg py-2 min-w-[200px] border">
                <Link to="/groups?category=UAE_ONE_WAY" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-accent">One Way Groups</Link>
                <Link to="/groups?category=UMRAH" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-accent">Umrah Groups</Link>
                <Link to="/calculator" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-accent">Umrah Calculator</Link>
                <Link to="/hotel-rates/makkah" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-accent">Makkah Hotels Rates</Link>
                <Link to="/hotel-rates/madina" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-accent">Madina Hotels Rates</Link>
              </div>
            )}
          </div>

          <a href="#about" className={`px-3 py-2 text-sm font-semibold rounded ${scrolled ? "text-white" : "text-primary"}`}>About</a>
          <a href="#contact" className={`px-3 py-2 text-sm font-semibold rounded ${scrolled ? "text-white" : "text-primary"}`}>Contact</a>

          {/* WhatsApp */}
          <a href="https://wa.me/923000381533" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#25D366] text-white text-sm font-semibold rounded-full hover:bg-[#1ebe5d] hover:-translate-y-0.5 transition-all">
            <FaWhatsapp /> WhatsApp
          </a>

          {/* Auth buttons */}
          {isAuthenticated ? (
            <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
              <button className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold ${scrolled ? "text-white" : "text-primary"}`}>
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary text-xs font-bold">
                  {user?.contactPerson?.[0] || "U"}
                </div>
                Welcome {user?.contactPerson?.split(" ")[0]} <FaChevronDown className="text-xs" />
              </button>
              {userMenuOpen && (
                <div className="absolute top-full right-0 bg-white shadow-xl rounded-lg py-2 min-w-[180px] border">
                  <Link to={isAdmin ? "/admin" : "/agent"} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FaTachometerAlt /> {isAdmin ? "Admin" : "Agent"} Dashboard
                  </Link>
                  <Link to={isAdmin ? "/admin" : "/agent/change-password"} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FaKey /> Change Password
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/register" className={`px-4 py-1.5 text-sm font-semibold rounded-full border-2 ${scrolled ? "border-white text-white hover:bg-white hover:text-accent" : "border-primary text-primary hover:bg-primary hover:text-white"} transition-all`}>
                Register Now
              </Link>
              <Link to="/login" className="px-4 py-1.5 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary-dark transition-all">
                Login Now
              </Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-xl">
          {mobileOpen ? <FaTimes className={scrolled ? "text-white" : "text-primary"} /> : <FaBars className={scrolled ? "text-white" : "text-primary"} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white shadow-xl border-t">
          <div className="p-4 flex flex-col gap-2">
            <Link to="/" className="px-3 py-2 text-primary font-semibold" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/groups" className="px-3 py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Flight Groups</Link>
            <Link to="/packages" className="px-3 py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Umrah Packages</Link>
            <Link to="/calculator" className="px-3 py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Umrah Calculator</Link>
            <a href="https://wa.me/923000381533" className="flex items-center gap-2 px-3 py-2 text-[#25D366] font-semibold">
              <FaWhatsapp /> WhatsApp
            </a>
            <div className="border-t my-2" />
            {isAuthenticated ? (
              <>
                <Link to={isAdmin ? "/admin" : "/agent"} className="px-3 py-2 text-primary font-semibold" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="px-3 py-2 text-red-500 font-semibold text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/register" className="px-3 py-2 text-accent font-semibold" onClick={() => setMobileOpen(false)}>Register Now</Link>
                <Link to="/login" className="px-3 py-2 bg-primary text-white rounded text-center font-semibold" onClick={() => setMobileOpen(false)}>Login Now</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

import { Link } from "react-router-dom";
import { FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-deepblue text-white" id="contact">
      <div className="border-t-4 border-accent" />

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">
            <span className="text-accent">Online Portal</span> | Mirza Travel
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p className="flex items-start gap-2">
              <FaMapMarkerAlt className="text-accent mt-1 shrink-0" />
              Az Mall, Kohenoor Town, Faisalabad, Punjab, Pakistan
            </p>
            <p className="flex items-center gap-2">
              <FaPhone className="text-accent" /> 24/7 Support: +92 3000381533
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-accent" /> support@mirzatravel.pk
            </p>
            <p className="flex items-center gap-2">
              <FaWhatsapp className="text-accent" /> +92 3000381533
            </p>
          </div>
        </div>

        {/* Umrah */}
        <div>
          <h3 className="text-lg font-bold mb-4">Umrah Calculator</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/calculator" className="hover:text-accent flex items-center gap-2"><span className="text-accent">›</span> Umrah Packages</Link></li>
            <li><Link to="/hotel-rates/makkah" className="hover:text-accent flex items-center gap-2"><span className="text-accent">›</span> Makkah Hotel Rates</Link></li>
            <li><Link to="/hotel-rates/madina" className="hover:text-accent flex items-center gap-2"><span className="text-accent">›</span> Madina Hotel Rates</Link></li>
          </ul>
        </div>

        {/* Airlines */}
        <div>
          <h3 className="text-lg font-bold mb-4">Airline Group Booking</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/groups?category=UAE_ONE_WAY" className="hover:text-accent flex items-center gap-2"><span className="text-accent">›</span> One Way Groups</Link></li>
            <li><Link to="/groups?category=UMRAH" className="hover:text-accent flex items-center gap-2"><span className="text-accent">›</span> Umrah Groups</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-bold mb-4">Follow Us</h3>
          <div className="flex gap-3 mb-4">
            {[FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaLinkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 bg-deepblue-light rounded-full flex items-center justify-center text-gray-300 hover:bg-accent hover:text-white transition-all">
                <Icon />
              </a>
            ))}
          </div>
          <p className="text-sm text-accent font-semibold">Cheapest Rates for Agents</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-600">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Mirza Travel & Tourism. All Rights Reserved</p>
          <p>Designed and Developed with care</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

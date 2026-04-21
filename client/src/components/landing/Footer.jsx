import { Link } from "react-router-dom";
import {
  FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaLinkedin,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaWhatsapp,
  FaPlane, FaKaaba, FaCalculator, FaHotel, FaBoxOpen,
  FaArrowRight, FaShieldAlt,
} from "react-icons/fa";

const FooterLink = ({ to, children }) => (
  <li>
    <Link to={to} className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors text-sm group">
      <FaArrowRight className="text-[9px] text-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      {children}
    </Link>
  </li>
);

const SocialIcon = ({ Icon, href }) => (
  <a href={href} target="_blank" rel="noreferrer"
    className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-accent hover:text-primary hover:border-accent transition-all text-sm">
    <Icon />
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-[#030f1a] text-white" id="contact">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand */}
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg">
                <FaKaaba className="text-primary text-lg" />
              </div>
              <div>
                <div className="text-white font-bold text-base font-poppins leading-tight">MIRZA TRAVEL</div>
                <div className="text-accent text-[9px] font-semibold tracking-widest uppercase">&amp; Tourism</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Pakistan's premier travel agency offering exclusive group tickets, Umrah packages, and agent portal services since 2009.
            </p>

            {/* Contact info */}
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <FaMapMarkerAlt className="text-accent mt-0.5 shrink-0" />
                <span>Office no 10 Ramtli Chowk butt plaza opposite Qand fishan sweets GT road Gujrat</span>
              </li>
              <li>
                <a href="tel:+923000381533" className="flex items-center gap-3 text-sm text-gray-400 hover:text-accent transition-colors">
                  <FaPhone className="text-accent shrink-0" /> 03197810226
                </a>
              </li>
              <li>
                <a href="mailto:Smirzatravel.group@outlook.com" className="flex items-center gap-3 text-sm text-gray-400 hover:text-accent transition-colors">
                  <FaEnvelope className="text-accent shrink-0" /> Smirzatravel.group@outlook.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/923000381533" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-accent transition-colors">
                  <FaWhatsapp className="text-[#25D366] shrink-0" /> WhatsApp: 03197810226
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 — Umrah Services */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-accent rounded" />
              Umrah Services
            </h3>
            <ul className="space-y-2.5">
              <FooterLink to="/calculator">Umrah Calculator</FooterLink>
              <FooterLink to="/packages">Umrah Packages</FooterLink>
              <FooterLink to="/hotel-rates/makkah">Makkah Hotel Rates</FooterLink>
              <FooterLink to="/hotel-rates/madina">Madina Hotel Rates</FooterLink>
              <FooterLink to="/groups?category=UMRAH">Umrah Groups</FooterLink>
            </ul>
          </div>

          {/* Column 3 — Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-accent rounded" />
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <FooterLink to="/groups?category=UAE_ONE_WAY">One Way Groups</FooterLink>
              <FooterLink to="/register">Register as Agent</FooterLink>
              <FooterLink to="/login">Agent Login</FooterLink>
              <FooterLink to="/admin/login">Admin Portal</FooterLink>
            </ul>

            {/* Trust badges */}
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FaShieldAlt className="text-accent text-sm" />
                <span className="text-xs font-bold text-white">Certified & Trusted</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">IATA Accredited · PATA Member · Ministry of Tourism Registered</p>
            </div>
          </div>

          {/* Column 4 — Follow & WhatsApp */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-accent rounded" />
              Follow Us
            </h3>
            <div className="flex gap-2 mb-6">
              <SocialIcon Icon={FaFacebook} href="#" />
              <SocialIcon Icon={FaInstagram} href="#" />
              <SocialIcon Icon={FaTwitter} href="#" />
              <SocialIcon Icon={FaYoutube} href="#" />
              <SocialIcon Icon={FaLinkedin} href="#" />
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/923000381533" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl hover:bg-[#25D366]/20 transition-all group mb-5">
              <div className="w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center shrink-0 shadow">
                <FaWhatsapp className="text-white text-xl" />
              </div>
              <div>
                <div className="text-white text-sm font-bold">Chat with Us</div>
                <div className="text-gray-400 text-xs">Available 24/7</div>
              </div>
            </a>

            {/* Office hours */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs font-bold text-white mb-2">Office Hours</p>
              <p className="text-[11px] text-gray-400">Mon – Sat: 9:00 AM – 7:00 PM</p>
              <p className="text-[11px] text-gray-400">Sunday: 10:00 AM – 4:00 PM</p>
              <p className="text-[11px] text-accent mt-1 font-semibold">WhatsApp: 24/7 Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Mirza Travel & Tourism. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with care for Pakistan's travel industry
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

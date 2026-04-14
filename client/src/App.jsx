import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// Layouts
import LandingLayout from "./layouts/LandingLayout";
import AgentLayout from "./layouts/AgentLayout";
import AdminLayout from "./layouts/AdminLayout";

// Protected Routes
import { AgentRoute, AdminRoute } from "./components/common/ProtectedRoute";

// Landing Pages
import Home from "./pages/landing/Home";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/auth/AdminLogin";

// Agent Pages
import AgentDashboard from "./pages/agent/Dashboard";
import FlightGroups from "./pages/agent/FlightGroups";
import Bookings from "./pages/agent/Bookings";
import BookingDetail from "./pages/agent/BookingDetail";
import UmrahPackages from "./pages/agent/UmrahPackages";
import UmrahCalculator from "./pages/agent/UmrahCalculator";
import HotelRates from "./pages/agent/HotelRates";
import BankDetails from "./pages/agent/BankDetails";
import Payments from "./pages/agent/Payments";
import Ledger from "./pages/agent/Ledger";
import Profile from "./pages/agent/Profile";
import ChangePassword from "./pages/agent/ChangePassword";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import Agents from "./pages/admin/Agents";
import Airlines from "./pages/admin/Airlines";
import Sectors from "./pages/admin/Sectors";
import AdminGroups from "./pages/admin/AdminGroups";
import AdminBookings from "./pages/admin/AdminBookings";
import Hotels from "./pages/admin/Hotels";
import VisaTypes from "./pages/admin/VisaTypes";
import Transport from "./pages/admin/Transport";
import PaymentVerification from "./pages/admin/PaymentVerification";
import BankAccounts from "./pages/admin/BankAccounts";
import AgentLedgers from "./pages/admin/AgentLedgers";
import OfficeBranches from "./pages/admin/OfficeBranches";
import Authorizations from "./pages/admin/Authorizations";
import Deals from "./pages/admin/Deals";
import Settings from "./pages/admin/Settings";
import AdminPackages from "./pages/admin/AdminPackages";
import Reports from "./pages/admin/Reports";

// Placeholder
import ComingSoon from "./pages/ComingSoon";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

        <Routes>
          {/* ═══ PUBLIC LANDING ═══ */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* ═══ AUTH PAGES (No Layout) ═══ */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ═══ AGENT PANEL ═══ */}
          <Route path="/agent" element={<AgentRoute><AgentLayout /></AgentRoute>}>
            <Route index element={<AgentDashboard />} />
            <Route path="groups" element={<FlightGroups />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="packages" element={<UmrahPackages />} />
            <Route path="calculator" element={<UmrahCalculator />} />
            <Route path="hotel-rates" element={<HotelRates />} />
            <Route path="bank-details" element={<BankDetails />} />
            <Route path="payments" element={<Payments />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="profile" element={<Profile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          {/* ═══ ADMIN PANEL ═══ */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="agents" element={<Agents />} />
            <Route path="airlines" element={<Airlines />} />
            <Route path="sectors" element={<Sectors />} />
            <Route path="groups" element={<AdminGroups />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="visa-types" element={<VisaTypes />} />
            <Route path="transport" element={<Transport />} />
            <Route path="payments" element={<PaymentVerification />} />
            <Route path="bank-accounts" element={<BankAccounts />} />
            <Route path="ledger" element={<AgentLedgers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="branches" element={<OfficeBranches />} />
            <Route path="authorizations" element={<Authorizations />} />
            <Route path="deals" element={<Deals />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-primary">404</h1>
                <p className="text-gray-500 mt-2">Page not found</p>
                <a href="/" className="inline-block mt-4 px-6 py-2 bg-accent text-white rounded-lg">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

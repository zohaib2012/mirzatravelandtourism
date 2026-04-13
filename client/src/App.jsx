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
import Bookings from "./pages/agent/Bookings";
import BookingDetail from "./pages/agent/BookingDetail";
import BankDetails from "./pages/agent/BankDetails";
import Payments from "./pages/agent/Payments";
import Ledger from "./pages/agent/Ledger";
import Profile from "./pages/agent/Profile";
import ChangePassword from "./pages/agent/ChangePassword";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";

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
            <Route path="groups" element={<ComingSoon title="Flight Groups" />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="packages" element={<ComingSoon title="Umrah Packages" />} />
            <Route path="calculator" element={<ComingSoon title="Umrah Calculator" />} />
            <Route path="hotel-rates" element={<ComingSoon title="Hotel Rates" />} />
            <Route path="bank-details" element={<BankDetails />} />
            <Route path="payments" element={<Payments />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="profile" element={<Profile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          {/* ═══ ADMIN PANEL ═══ */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="agents" element={<ComingSoon title="Agent Management" />} />
            <Route path="airlines" element={<ComingSoon title="Airlines" />} />
            <Route path="sectors" element={<ComingSoon title="Sectors / Routes" />} />
            <Route path="groups" element={<ComingSoon title="Flight Groups" />} />
            <Route path="bookings" element={<ComingSoon title="All Bookings" />} />
            <Route path="packages" element={<ComingSoon title="Umrah Packages" />} />
            <Route path="hotels" element={<ComingSoon title="Hotels" />} />
            <Route path="visa-types" element={<ComingSoon title="Visa Types" />} />
            <Route path="transport" element={<ComingSoon title="Transport" />} />
            <Route path="payments" element={<ComingSoon title="Payment Verification" />} />
            <Route path="bank-accounts" element={<ComingSoon title="Bank Accounts" />} />
            <Route path="ledger" element={<ComingSoon title="Agent Ledgers" />} />
            <Route path="reports" element={<ComingSoon title="Reports" />} />
            <Route path="branches" element={<ComingSoon title="Office Branches" />} />
            <Route path="authorizations" element={<ComingSoon title="Authorizations" />} />
            <Route path="deals" element={<ComingSoon title="Deals & Offers" />} />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
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

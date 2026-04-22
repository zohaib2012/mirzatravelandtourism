import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData - let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === "TOKEN_EXPIRED" && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken });

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  sendAdminOTP: (data) => api.post("/auth/admin/send-otp", data),
  verifyAdminOTP: (data) => api.post("/auth/admin/verify-otp", data),
  resendAdminOTP: (data) => api.post("/auth/admin/resend-otp", data),
};

// Groups APIs
export const groupAPI = {
  getAll: (params) => api.get("/groups", { params }),
  getById: (id) => api.get(`/groups/${id}`),
  getFilters: (params) => api.get("/groups/filters", { params }),
  create: (data) => api.post("/groups", data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post("/bookings", data),
  getMy: (params) => api.get("/bookings/my", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getAll: (params) => api.get("/bookings", { params }),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  getDetail: (id) => api.get(`/bookings/${id}/detail`),
  updatePassengers: (id, data) => api.put(`/bookings/${id}/passengers`, data),
};

// Upload APIs
export const uploadAPI = {
  passport: (formData) => api.post("/upload/passport", formData),
};

// Package APIs
export const packageAPI = {
  getAll: (params) => api.get("/packages", { params }),
  getById: (id) => api.get(`/packages/${id}`),
  getVisaTypes: () => api.get("/packages/visa-types"),
  getTransports: () => api.get("/packages/transports"),
  getHotels: (params) => api.get("/packages/hotels", { params }),
  create: (data) => api.post("/packages", data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
};

// Payment APIs
export const paymentAPI = {
  submit: (data) => api.post("/payments", data, { headers: { "Content-Type": "multipart/form-data" } }),
  getMy: (params) => api.get("/payments/my", { params }),
  getAll: (params) => api.get("/payments", { params }),
  updateStatus: (id, data) => api.put(`/payments/${id}/status`, data),
  getLedger: (params) => api.get("/payments/ledger", { params }),
  getBankAccounts: () => api.get("/payments/bank-accounts"),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),

  // Agents
  getAgents: (params) => api.get("/admin/agents", { params }),
  updateAgentStatus: (id, data) => api.put(`/admin/agents/${id}/status`, data),

  // Airlines
  getAirlines: () => api.get("/admin/airlines"),
  createAirline: (data) => api.post("/admin/airlines", data),
  updateAirline: (id, data) => api.put(`/admin/airlines/${id}`, data),
  deleteAirline: (id) => api.delete(`/admin/airlines/${id}`),

  // Sectors
  getSectors: () => api.get("/admin/sectors"),
  createSector: (data) => api.post("/admin/sectors", data),
  updateSector: (id, data) => api.put(`/admin/sectors/${id}`, data),
  deleteSector: (id) => api.delete(`/admin/sectors/${id}`),

  // Flight Groups (admin)
  getAdminGroups: (params) => api.get("/admin/groups", { params }),
  createGroup: (data) => api.post("/admin/groups", data),
  updateGroup: (id, data) => api.put(`/admin/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/admin/groups/${id}`),

  // All Bookings (admin)
  getAllBookings: (params) => api.get("/admin/bookings", { params }),
  updateBookingStatus: (id, data) => api.put(`/admin/bookings/${id}/status`, data),

  // Hotels
  getHotels: (params) => api.get("/admin/hotels", { params }),
  createHotel: (data) => api.post("/admin/hotels", data),
  updateHotel: (id, data) => api.put(`/admin/hotels/${id}`, data),
  deleteHotel: (id) => api.delete(`/admin/hotels/${id}`),

  // Visa Types
  getVisaTypes: () => api.get("/admin/visa-types"),
  createVisaType: (data) => api.post("/admin/visa-types", data),
  updateVisaType: (id, data) => api.put(`/admin/visa-types/${id}`, data),
  deleteVisaType: (id) => api.delete(`/admin/visa-types/${id}`),

  // Transport
  getTransports: () => api.get("/admin/transport"),
  createTransport: (data) => api.post("/admin/transport", data),
  updateTransport: (id, data) => api.put(`/admin/transport/${id}`, data),
  deleteTransport: (id) => api.delete(`/admin/transport/${id}`),

  // Payments (admin)
  getAllPayments: (params) => api.get("/admin/payments", { params }),
  updatePaymentStatus: (id, data) => api.put(`/admin/payments/${id}/status`, data),

  // Bank Accounts
  getBankAccounts: () => api.get("/admin/bank-accounts"),
  createBankAccount: (data) => api.post("/admin/bank-accounts", data),
  updateBankAccount: (id, data) => api.put(`/admin/bank-accounts/${id}`, data),
  deleteBankAccount: (id) => api.delete(`/admin/bank-accounts/${id}`),

  // Office Branches
  getBranches: () => api.get("/admin/branches"),
  createBranch: (data) => api.post("/admin/branches", data),
  updateBranch: (id, data) => api.put(`/admin/branches/${id}`, data),
  deleteBranch: (id) => api.delete(`/admin/branches/${id}`),

  // Authorizations
  getAuthorizations: () => api.get("/admin/authorizations"),
  createAuthorization: (data) => api.post("/admin/authorizations", data),
  updateAuthorization: (id, data) => api.put(`/admin/authorizations/${id}`, data),
  deleteAuthorization: (id) => api.delete(`/admin/authorizations/${id}`),

  // Deals
  getDeals: () => api.get("/admin/deals"),
  createDeal: (data) => api.post("/admin/deals", data),
  updateDeal: (id, data) => api.put(`/admin/deals/${id}`, data),
  deleteDeal: (id) => api.delete(`/admin/deals/${id}`),

  // Umrah Packages (admin)
  getAdminPackages: (params) => api.get("/admin/packages", { params }),
  createPackage: (data) => api.post("/admin/packages", data),
  updatePackage: (id, data) => api.put(`/admin/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/admin/packages/${id}`),

  // Settings
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.put("/admin/settings", data),
  updatePassword: (data) => api.put("/admin/password", data),

  // Reports
  getReports: () => api.get("/admin/reports"),

  // Agent Ledger (admin view)
  getAgentLedger: (agentId, params) => api.get(`/admin/ledger/${agentId}`, { params }),
};

// Public APIs
export const publicAPI = {
  getBranches: () => api.get("/public/branches"),
  getAuthorizations: () => api.get("/public/authorizations"),
  getDeals: () => api.get("/public/deals"),
  getSettings: () => api.get("/public/settings"),
};

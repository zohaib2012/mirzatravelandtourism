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
  getAgents: (params) => api.get("/admin/agents", { params }),
  updateAgentStatus: (id, data) => api.put(`/admin/agents/${id}/status`, data),
  getAirlines: () => api.get("/admin/airlines"),
  createAirline: (data) => api.post("/admin/airlines", data),
  updateAirline: (id, data) => api.put(`/admin/airlines/${id}`, data),
  getSectors: () => api.get("/admin/sectors"),
  createSector: (data) => api.post("/admin/sectors", data),
  createHotel: (data) => api.post("/admin/hotels", data),
  updateHotel: (id, data) => api.put(`/admin/hotels/${id}`, data),
  createVisaType: (data) => api.post("/admin/visa-types", data),
  updateVisaType: (id, data) => api.put(`/admin/visa-types/${id}`, data),
  createTransport: (data) => api.post("/admin/transport", data),
  updateTransport: (id, data) => api.put(`/admin/transport/${id}`, data),
  createBankAccount: (data) => api.post("/admin/bank-accounts", data),
  updateBankAccount: (id, data) => api.put(`/admin/bank-accounts/${id}`, data),
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.put("/admin/settings", data),
};

// Public APIs
export const publicAPI = {
  getBranches: () => api.get("/public/branches"),
  getAuthorizations: () => api.get("/public/authorizations"),
  getDeals: () => api.get("/public/deals"),
  getSettings: () => api.get("/public/settings"),
};

import { Router } from "express";
import * as admin from "../controllers/adminController.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

// Dashboard
router.get("/dashboard", admin.getDashboardStats);

// Agents
router.get("/agents", admin.getAgents);
router.put("/agents/:id/status", admin.updateAgentStatus);
router.get("/ledger/:agentId", admin.getAgentLedger);

// Airlines
router.get("/airlines", admin.getAirlines);
router.post("/airlines", admin.createAirline);
router.put("/airlines/:id", admin.updateAirline);
router.delete("/airlines/:id", admin.deleteAirline);

// Sectors
router.get("/sectors", admin.getSectors);
router.post("/sectors", admin.createSector);
router.put("/sectors/:id", admin.updateSector);
router.delete("/sectors/:id", admin.deleteSector);

// Flight Groups (admin)
router.get("/groups", admin.getAdminGroups);
router.post("/groups", admin.createGroup);
router.put("/groups/:id", admin.updateGroup);
router.delete("/groups/:id", admin.deleteGroup);

// All Bookings (admin)
router.get("/bookings", admin.getAllBookings);
router.put("/bookings/:id/status", admin.updateBookingStatus);

// Hotels
router.get("/hotels", admin.getHotels);
router.post("/hotels", admin.createHotel);
router.put("/hotels/:id", admin.updateHotel);
router.delete("/hotels/:id", admin.deleteHotel);

// Visa Types
router.get("/visa-types", admin.getVisaTypes);
router.post("/visa-types", admin.createVisaType);
router.put("/visa-types/:id", admin.updateVisaType);
router.delete("/visa-types/:id", admin.deleteVisaType);

// Transport
router.get("/transport", admin.getTransports);
router.post("/transport", admin.createTransport);
router.put("/transport/:id", admin.updateTransport);
router.delete("/transport/:id", admin.deleteTransport);

// Payments (admin)
router.get("/payments", admin.getAllPayments);
router.put("/payments/:id/status", admin.updatePaymentStatus);

// Bank Accounts
router.get("/bank-accounts", admin.getBankAccounts);
router.post("/bank-accounts", admin.createBankAccount);
router.put("/bank-accounts/:id", admin.updateBankAccount);
router.delete("/bank-accounts/:id", admin.deleteBankAccount);

// Office Branches
router.get("/branches", admin.getOfficeBranches);
router.post("/branches", admin.createOfficeBranch);
router.put("/branches/:id", admin.updateOfficeBranch);
router.delete("/branches/:id", admin.deleteOfficeBranch);

// Authorizations
router.get("/authorizations", admin.getAuthorizations);
router.post("/authorizations", admin.createAuthorization);
router.put("/authorizations/:id", admin.updateAuthorization);
router.delete("/authorizations/:id", admin.deleteAuthorization);

// Deals
router.get("/deals", admin.getDeals);
router.post("/deals", admin.createDeal);
router.put("/deals/:id", admin.updateDeal);
router.delete("/deals/:id", admin.deleteDeal);

// Umrah Packages (admin)
router.get("/packages", admin.getAdminPackages);
router.post("/packages", admin.createPackage);
router.put("/packages/:id", admin.updatePackage);
router.delete("/packages/:id", admin.deletePackage);

// Settings
router.get("/settings", admin.getCompanySettings);
router.put("/settings", admin.updateCompanySettings);

// Reports
router.get("/reports", admin.getReports);

export default router;

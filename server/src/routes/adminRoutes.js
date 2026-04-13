const router = require("express").Router();
const admin = require("../controllers/adminController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// All routes require admin auth
router.use(authenticate, authorizeAdmin);

// Dashboard
router.get("/dashboard", admin.getDashboardStats);

// Agents
router.get("/agents", admin.getAgents);
router.put("/agents/:id/status", admin.updateAgentStatus);

// Airlines
router.get("/airlines", admin.getAirlines);
router.post("/airlines", admin.createAirline);
router.put("/airlines/:id", admin.updateAirline);

// Sectors
router.get("/sectors", admin.getSectors);
router.post("/sectors", admin.createSector);
router.put("/sectors/:id", admin.updateSector);

// Hotels
router.post("/hotels", admin.createHotel);
router.put("/hotels/:id", admin.updateHotel);
router.delete("/hotels/:id", admin.deleteHotel);

// Visa Types
router.post("/visa-types", admin.createVisaType);
router.put("/visa-types/:id", admin.updateVisaType);

// Transport
router.post("/transport", admin.createTransport);
router.put("/transport/:id", admin.updateTransport);

// Bank Accounts
router.post("/bank-accounts", admin.createBankAccount);
router.put("/bank-accounts/:id", admin.updateBankAccount);

// Office Branches
router.get("/branches", admin.getOfficeBranches);
router.post("/branches", admin.createOfficeBranch);
router.put("/branches/:id", admin.updateOfficeBranch);

// Authorizations
router.get("/authorizations", admin.getAuthorizations);
router.post("/authorizations", admin.createAuthorization);

// Deals
router.get("/deals", admin.getDeals);
router.post("/deals", admin.createDeal);

// Company Settings
router.get("/settings", admin.getCompanySettings);
router.put("/settings", admin.updateCompanySettings);

module.exports = router;

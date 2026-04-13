import { Router } from "express";
import * as admin from "../controllers/adminController.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/dashboard", admin.getDashboardStats);
router.get("/agents", admin.getAgents);
router.put("/agents/:id/status", admin.updateAgentStatus);
router.get("/airlines", admin.getAirlines);
router.post("/airlines", admin.createAirline);
router.put("/airlines/:id", admin.updateAirline);
router.get("/sectors", admin.getSectors);
router.post("/sectors", admin.createSector);
router.put("/sectors/:id", admin.updateSector);
router.post("/hotels", admin.createHotel);
router.put("/hotels/:id", admin.updateHotel);
router.delete("/hotels/:id", admin.deleteHotel);
router.post("/visa-types", admin.createVisaType);
router.put("/visa-types/:id", admin.updateVisaType);
router.post("/transport", admin.createTransport);
router.put("/transport/:id", admin.updateTransport);
router.post("/bank-accounts", admin.createBankAccount);
router.put("/bank-accounts/:id", admin.updateBankAccount);
router.get("/branches", admin.getOfficeBranches);
router.post("/branches", admin.createOfficeBranch);
router.put("/branches/:id", admin.updateOfficeBranch);
router.get("/authorizations", admin.getAuthorizations);
router.post("/authorizations", admin.createAuthorization);
router.get("/deals", admin.getDeals);
router.post("/deals", admin.createDeal);
router.get("/settings", admin.getCompanySettings);
router.put("/settings", admin.updateCompanySettings);

export default router;

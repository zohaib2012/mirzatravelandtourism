import { Router } from "express";
import * as admin from "../controllers/adminController.js";

const router = Router();

router.get("/branches", admin.getOfficeBranches);
router.get("/authorizations", admin.getAuthorizations);
router.get("/deals", admin.getDeals);
router.get("/settings", admin.getCompanySettings);

export default router;

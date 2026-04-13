import { Router } from "express";
import * as pkg from "../controllers/packageController.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, pkg.getPackages);
router.get("/visa-types", authenticate, pkg.getVisaTypes);
router.get("/transports", authenticate, pkg.getTransports);
router.get("/hotels", authenticate, pkg.getHotels);
router.get("/:id", authenticate, pkg.getPackageById);

router.post("/", authenticate, authorizeAdmin, pkg.createPackage);
router.put("/:id", authenticate, authorizeAdmin, pkg.updatePackage);
router.delete("/:id", authenticate, authorizeAdmin, pkg.deletePackage);

export default router;

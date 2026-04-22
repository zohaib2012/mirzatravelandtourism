import { Router } from "express";
import { getUploadSignature } from "../controllers/uploadController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Returns signature for direct browser-to-Cloudinary upload
router.get("/signature", authenticate, getUploadSignature);

export default router;

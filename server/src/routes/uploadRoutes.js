import { Router } from "express";
import { upload, uploadPassport } from "../controllers/uploadController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/passport", authenticate, upload.single("file"), uploadPassport);

export default router;

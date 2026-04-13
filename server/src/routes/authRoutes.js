import { Router } from "express";
import * as auth from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/refresh-token", auth.refreshToken);
router.put("/change-password", authenticate, auth.changePassword);
router.get("/profile", authenticate, auth.getProfile);
router.put("/profile", authenticate, auth.updateProfile);

export default router;

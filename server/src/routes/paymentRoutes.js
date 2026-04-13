import { Router } from "express";
import * as payment from "../controllers/paymentController.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/", authenticate, upload.single("receipt"), payment.submitPayment);
router.get("/my", authenticate, payment.getMyPayments);
router.get("/ledger", authenticate, payment.getLedger);
router.get("/bank-accounts", authenticate, payment.getBankAccounts);

router.get("/", authenticate, authorizeAdmin, payment.getAllPayments);
router.put("/:id/status", authenticate, authorizeAdmin, payment.updatePaymentStatus);

export default router;

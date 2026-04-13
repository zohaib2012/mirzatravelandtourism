const router = require("express").Router();
const payment = require("../controllers/paymentController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Agent routes
router.post("/", authenticate, upload.single("receipt"), payment.submitPayment);
router.get("/my", authenticate, payment.getMyPayments);
router.get("/ledger", authenticate, payment.getLedger);
router.get("/bank-accounts", authenticate, payment.getBankAccounts);

// Admin routes
router.get("/", authenticate, authorizeAdmin, payment.getAllPayments);
router.put("/:id/status", authenticate, authorizeAdmin, payment.updatePaymentStatus);

module.exports = router;

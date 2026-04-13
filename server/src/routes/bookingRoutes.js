const router = require("express").Router();
const booking = require("../controllers/bookingController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// Agent routes
router.post("/", authenticate, booking.createBooking);
router.get("/my", authenticate, booking.getMyBookings);
router.get("/:id", authenticate, booking.getBookingById);

// Admin routes
router.get("/", authenticate, authorizeAdmin, booking.getAllBookings);
router.put("/:id/status", authenticate, authorizeAdmin, booking.updateBookingStatus);

module.exports = router;

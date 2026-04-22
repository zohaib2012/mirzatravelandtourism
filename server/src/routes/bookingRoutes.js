import { Router } from "express";
import * as booking from "../controllers/bookingController.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, booking.createBooking);
router.get("/my", authenticate, booking.getMyBookings);
router.get("/:id", authenticate, booking.getBookingById);

router.get("/", authenticate, authorizeAdmin, booking.getAllBookings);
router.get("/:id/detail", authenticate, authorizeAdmin, booking.getBookingDetail);
router.put("/:id/passengers", authenticate, authorizeAdmin, booking.updateBookingPassengers);
router.put("/:id/status", authenticate, authorizeAdmin, booking.updateBookingStatus);

export default router;

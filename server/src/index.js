import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts, please try again later" },
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/groups", groupRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/packages", packageRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/public", publicRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  if (err.name === "MulterError") {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { generateAgentCode } from "../utils/helpers.js";
import { sendOTPEmail } from "../utils/otpEmail.js";

const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { agencyName, contactPerson, email, password, phone, city, country } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let agentCode;
    let isUnique = false;
    while (!isUnique) {
      agentCode = generateAgentCode();
      const existing = await prisma.user.findUnique({ where: { agentCode } });
      if (!existing) isUnique = true;
    }

    const user = await prisma.user.create({
      data: {
        agentCode,
        agencyName,
        contactPerson,
        email,
        password: hashedPassword,
        phone,
        city,
        country: country || "Pakistan",
        role: "AGENT",
        status: "PENDING",
      },
    });

    res.status(201).json({
      message: "Registration successful. Please wait for admin approval.",
      agentCode: user.agentCode,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { agentCode, email, password } = req.body;

    let foundUser = null;
    if (agentCode && email) {
      foundUser = await prisma.user.findFirst({
        where: { agentCode, email },
      });
    } else if (email) {
      foundUser = await prisma.user.findFirst({
        where: { email, role: "ADMIN" },
      });
    }

    if (!foundUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (foundUser.status === "PENDING") {
      return res.status(403).json({ message: "Account pending approval. Please contact admin." });
    }
    if (foundUser.status === "INACTIVE" || foundUser.status === "REJECTED") {
      return res.status(403).json({ message: "Account is deactivated. Please contact admin." });
    }

    const { accessToken, refreshToken } = generateTokens(foundUser.id, foundUser.role);

    res.json({
      message: "Login successful",
      user: {
        id: foundUser.id,
        agentCode: foundUser.agentCode,
        agencyName: foundUser.agencyName,
        contactPerson: foundUser.contactPerson,
        email: foundUser.email,
        role: foundUser.role,
        logoUrl: foundUser.logoUrl,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = generateTokens(decoded.userId, decoded.role);

    res.json(tokens);
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, agentCode: true, agencyName: true, contactPerson: true,
        email: true, phone: true, city: true, country: true, logoUrl: true,
        role: true, status: true, createdAt: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { contactPerson, phone, city, country } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { contactPerson, phone, city, country },
      select: {
        id: true, agentCode: true, agencyName: true, contactPerson: true,
        email: true, phone: true, city: true, country: true, logoUrl: true,
      },
    });

    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const sendAdminOTP = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findFirst({
      where: { email, role: "ADMIN" },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account is not active" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt });

    console.log(`[OTP] Generated for ${email}: ${otp}`);

    const result = await sendOTPEmail(otp);
    if (!result.success) {
      console.error("[OTP] Email send failed:", result.error);
      const isDev = process.env.NODE_ENV !== "production";
      return res.status(500).json({
        message: "Failed to send OTP email",
        ...(isDev && { detail: String(result.error?.message || result.error) }),
      });
    }

    res.json({ message: "OTP sent to admin email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

export const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ message: "OTP not requested or expired" });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (storedData.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    otpStore.delete(email);

    const user = await prisma.user.findFirst({
      where: { email, role: "ADMIN" },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        agentCode: user.agentCode,
        agencyName: user.agencyName,
        contactPerson: user.contactPerson,
        email: user.email,
        role: user.role,
        logoUrl: user.logoUrl,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resendAdminOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await prisma.user.findFirst({
      where: { email, role: "ADMIN" },
    });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt });

    const result = await sendOTPEmail(otp);
    if (!result.success) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.json({ message: "OTP resent to admin email" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

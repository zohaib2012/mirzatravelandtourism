import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { generateAgentCode } from "../utils/helpers.js";

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

    const where = {};
    if (agentCode) where.agentCode = agentCode;
    if (email) where.email = email;

    const user = await prisma.user.findFirst({ where: { AND: [where] } });

    // For admin login, only email + password (no agent code)
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

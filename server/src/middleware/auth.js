import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true, agentCode: true, agencyName: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account is not active" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const authorizeAgent = (req, res, next) => {
  if (req.user.role !== "AGENT") {
    return res.status(403).json({ message: "Agent access required" });
  }
  next();
};

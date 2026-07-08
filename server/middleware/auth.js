import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Mongoose: User.findById(decoded.id).select('-password')
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(401).json({ message: "User not found" });
    if (!user.isActive)
      return res.status(401).json({ message: "Account deactivated" });
    //req.user = user
    //next()
    // Keep the full user object if you still need it
    req.user = user;

    // Enterprise Request Context
    req.context = {
      userId: user.id,
      companyId: req.headers["x-company-id"] || user.companyId,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };

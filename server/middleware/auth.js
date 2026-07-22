import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          association: "roleInfo",
          attributes: [
            "id",
            "name",
            "permissions",
            "isActive",
            "isDeleted",
          ],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: "Account deactivated",
      });
    }

    if (
      user.roleInfo &&
      (!user.roleInfo.isActive || user.roleInfo.isDeleted)
    ) {
      return res.status(403).json({
        message: "Assigned role is inactive.",
      });
    }

    req.user = user;

    req.permissions = user.roleInfo?.permissions || {};

    req.context = {
      userId: user.id,
      companyId: req.headers["x-company-id"] || user.companyId,
      role: user.role,
      roleId: user.roleId,
      permissions: req.permissions,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error(err);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Existing Role Middleware
| Keep this for backward compatibility.
|--------------------------------------------------------------------------
*/

export const authorize =
  (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      next();
    };

/*
|--------------------------------------------------------------------------
| Enterprise Permission Middleware
|--------------------------------------------------------------------------
*/

export const authorizePermission =
  (permission) =>
    (req, res, next) => {

      // Super Admin bypass
      if (req.user.role === "super_admin") {
        return next();
      }

      let permissions = req.permissions || {};

      // Parse JSON string if needed
      if (typeof permissions === "string") {
        try {
          permissions = JSON.parse(permissions);
        } catch (err) {
          return res.status(500).json({
            message: "Invalid permissions format.",
          });
        }
      }

      const parts = permission.split(".");
      const module = parts[0];

      // Current database format
      if (permissions[module] === true) {
        return next();
      }

      // Future nested format
      let current = permissions;

      for (const part of parts) {
        if (current == null) break;
        current = current[part];
      }

      if (current === true) {
        return next();
      }

      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    };
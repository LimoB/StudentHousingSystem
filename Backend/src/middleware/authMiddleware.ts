import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

/* ================================
   Extend Express Request
================================ */

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

/* ================================
   User Roles (match schema)
================================ */

export type UserRole = "admin" | "landlord" | "student";

/* ================================
   JWT Payload
================================ */

export type DecodedToken = {
  userId: number;
  email: string;
  role: UserRole;
  exp?: number;
};

/* ================================
   Verify Token
================================ */

export const verifyToken = (
  token: string,
  secret: string
): DecodedToken | null => {
  try {
    return jwt.verify(token, secret) as DecodedToken;
  } catch (error) {
    return null;
  }
};

/* ================================
   Authentication Middleware
================================ */

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    res.status(401).json({
      message: "Authorization header missing",
    });
    return;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  const decoded = verifyToken(token, process.env.JWT_SECRET as string);

  if (!decoded) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
    return;
  }

  req.user = decoded;

  next();
};

/* ================================
   Role Guard
================================ */

export const roleGuard = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const roles = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
      return;
    }

    next();
  };
};

/* ================================
   Predefined Role Guards
================================ */

export const adminOnly = roleGuard("admin");

export const landlordOnly = roleGuard("landlord");

export const studentOnly = roleGuard("student");

export const adminOrLandlord = roleGuard(["admin", "landlord"]);

export const allUsers = roleGuard(["admin", "landlord", "student"]);
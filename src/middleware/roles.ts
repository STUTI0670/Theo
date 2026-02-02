import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";

export const requireRole = (role: "COORDINATOR" | "STUDENT") => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden for current role." });
    }
    return next();
  };
};

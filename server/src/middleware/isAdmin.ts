import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth/auth_type"

const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user || typeof req.user.isAdmin !== "boolean") {
    res.status(403).json({ error: "Permissions invalides ou manquantes." });
    return;
  }

  if (!req.user.isAdmin) {
    res
      .status(403)
      .json({ error: "Accès refusé. Droits administrateur requis." });
    return;
  }

  next();
};

export default isAdmin;

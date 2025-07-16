import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

interface TokenPayload {
  id: string;
}

export const isAuthenticatedForReservation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies.authToken;

  if (!token) {
    res.status(401).json({ message: "Accès non autorisé. Connexion requise." });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("La clé secrète JWT n'est pas définie.");
    res.status(500).json({ message: "Erreur de configuration du serveur." });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as TokenPayload;
    req.user = { id: payload.id };
    next();
  } catch (error) {
    res.status(403).json({ message: "Token invalide ou expiré." });
  }
};

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
}

const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.authToken;

  if (!token) {
    res.status(401).json({ error: "Connexion requise" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ error: "Erreur serveur" });
    return;
  }

  jwt.verify(
    token,
    jwtSecret,
    (err: jwt.VerifyErrors | null, decoded: unknown) => {
      if (err) {
        res.status(403).json({ error: "Token invalide" });
        return;
      }

      const payload = decoded as JWTPayload;

      if (!payload.isAdmin) {
        res.status(403).json({ error: "Accès refusé. Droits admin requis." });
        return;
      }

      next();
    },
  );
};

export default isAdmin;

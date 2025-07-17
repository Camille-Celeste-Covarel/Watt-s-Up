import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    isAdmin: boolean;
  };
}

interface TokenPayload {
  id: string;
  isAdmin: boolean;
}

const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies.authToken;

  if (!token) {
    res.status(401).json({ error: "Connexion requise" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("La clé secrète JWT n'est pas définie.");
    res.status(500).json({ error: "Erreur de configuration du serveur." });
    return;
  }

  jwt.verify(
    token,
    jwtSecret,
    (err: jwt.VerifyErrors | null, decoded: unknown) => {
      if (err) {
        res.status(403).json({ error: "Token invalide ou expiré." });
        return;
      }

      // Le token est valide, on attache les informations de l'utilisateur à la requête.
      const payload = decoded as TokenPayload;
      req.user = { id: payload.id, isAdmin: payload.isAdmin };
      next();
    },
  );
};

export default authenticateToken;

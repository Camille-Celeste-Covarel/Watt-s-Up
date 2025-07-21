import type { NextFunction, Request, Response } from "express";

// On étend le type Request d'Express pour inclure la propriété `user`
// que le middleware `authenticateToken` est censé ajouter.
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    isAdmin: boolean;
  };
}

const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  // 1. On vérifie que `authenticateToken` a bien fait son travail
  //    et que la propriété `isAdmin` est bien un booléen.
  if (!req.user || typeof req.user.isAdmin !== "boolean") {
    // Si ce n'est pas le cas, c'est une anomalie (token malformé, etc.).
    res.status(403).json({ error: "Permissions invalides ou manquantes." });
    return;
  }

  // 2. On vérifie la valeur du booléen.
  if (!req.user.isAdmin) {
    res
      .status(403)
      .json({ error: "Accès refusé. Droits administrateur requis." });
    return;
  }

  // 3. Si tout est bon, l'utilisateur est admin, on passe à la suite.
  next();
};

export default isAdmin;

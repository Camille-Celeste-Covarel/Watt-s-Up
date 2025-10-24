import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    isAdmin: boolean;
  };
}

export interface TokenPayload {
  id: string;
  isAdmin: boolean;
}

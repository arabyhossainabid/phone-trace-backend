import { Request } from "express";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  session?: AuthenticatedSession;
}

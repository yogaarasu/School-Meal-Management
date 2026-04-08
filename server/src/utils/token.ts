import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthTokenPayload } from "../types/auth.js";

export const signToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
};
import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE_NAME } from "../constants/shared.js";
import { ApiError } from "../utils/apiError.js";
import { verifyToken } from "../utils/token.js";

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    next(new ApiError(401, "Unauthorized"));
    return;
  }

  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    next(new ApiError(401, "Invalid session"));
  }
};

export const requireRole = (role: "ADMIN" | "ORGANIZER") => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth || req.auth.role !== role) {
      next(new ApiError(403, "Forbidden"));
      return;
    }

    next();
  };
};
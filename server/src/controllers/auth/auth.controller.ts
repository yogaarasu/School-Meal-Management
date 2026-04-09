import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { SESSION_COOKIE_NAME } from "../../constants/shared.js";
import { STRICT_PASSWORD_HINT, STRICT_PASSWORD_REGEX } from "../../constants/validation.js";
import { getSessionUser, loginUser } from "../../services/auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { signToken, verifyToken } from "../../utils/token.js";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().regex(STRICT_PASSWORD_REGEX, STRICT_PASSWORD_HINT)
});

const sameSitePolicy: "lax" | "none" = env.nodeEnv === "production" ? "none" : "lax";

const cookieConfig = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: sameSitePolicy,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const clearCookieConfig = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: sameSitePolicy
};

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.parse(req.body);
  const user = await loginUser(parsed.email.toLowerCase(), parsed.password);
  const token = signToken({ id: user.id, role: user.role });

  res.cookie(SESSION_COOKIE_NAME, token, cookieConfig);
  res.status(200).json({ user });
});

export const sessionController = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    res.status(200).json({ user: null });
    return;
  }

  try {
    const parsed = verifyToken(token);
    const user = await getSessionUser(parsed.role, parsed.id);
    res.status(200).json({ user });
  } catch {
    res.clearCookie(SESSION_COOKIE_NAME, clearCookieConfig);
    res.status(200).json({ user: null });
  }
});

export const logoutController = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, clearCookieConfig);
  res.status(200).json({ message: "Logged out" });
});


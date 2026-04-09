import { app } from "../src/app.js";
import { env } from "../src/config/env.js";
import { connectDatabase } from "../src/config/database.js";
import { ensurePricingConfig } from "../src/services/pricing.service.js";

let bootstrapPromise: Promise<void> | null = null;

const ensureBootstrapped = (): Promise<void> => {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await connectDatabase();
      await ensurePricingConfig();
    })();
  }

  return bootstrapPromise;
};

const normalizeOrigin = (value: string): string => value.trim().replace(/\/$/, "").toLowerCase();

const matchesAllowedOrigin = (requestOrigin: string): boolean => {
  return env.clientOrigins.some((allowed) => {
    const normalizedAllowed = normalizeOrigin(allowed);

    if (normalizedAllowed === requestOrigin) {
      return true;
    }

    if (!normalizedAllowed.includes("*")) {
      return false;
    }

    const pattern = normalizedAllowed.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${pattern}$`).test(requestOrigin);
  });
};

const applyCorsHeaders = (req: any, res: any): boolean => {
  const origin = req.headers?.origin;

  if (!origin) {
    return false;
  }

  const requestOrigin = normalizeOrigin(String(origin));

  if (!matchesAllowedOrigin(requestOrigin)) {
    return false;
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return true;
};

export default async function handler(req: any, res: any): Promise<void> {
  const hasAllowedOrigin = applyCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    if (!hasAllowedOrigin && req.headers?.origin) {
      res.status(403).json({ message: "Not allowed by CORS" });
      return;
    }

    res.status(204).end();
    return;
  }

  try {
    await ensureBootstrapped();
    app(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Server startup failed",
      detail: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

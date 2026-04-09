import { config as loadEnv } from "dotenv";

loadEnv();

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
};

const normalizeOrigin = (value: string): string => value.trim().replace(/\/$/, "").toLowerCase();

const parseOrigins = (value: string | undefined): string[] => {
  const raw = value || "http://localhost:5173";
  return raw
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter((origin) => origin.length > 0);
};

const adminIdentity = process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || "admin@schoolmeal.tn.gov";
const adminEmail = adminIdentity.includes("@") ? adminIdentity : `${adminIdentity}@schoolmeal.tn.gov`;
const clientOrigins = parseOrigins(process.env.CLIENT_ORIGIN);
const defaultPortalLoginUrl = `${(clientOrigins[0] || "http://localhost:5173").replace(/\/$/, "")}/login`;
const portalLoginUrl = process.env.PORTAL_LOGIN_URL?.trim() || defaultPortalLoginUrl;

export const env = {
  port: parseNumber(process.env.PORT, 4000),
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/school-meal-management",
  jwtSecret: process.env.JWT_SECRET || "change-this-secret",
  clientOrigin: clientOrigins[0] || "http://localhost:5173",
  clientOrigins,
  portalLoginUrl,
  adminEmail: adminEmail.toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@123",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseNumber(process.env.SMTP_PORT, 587),
  smtpSecure: parseBoolean(process.env.SMTP_SECURE, false),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFromName: process.env.SMTP_FROM_NAME || "TN School Meal Management",
  smtpFromEmail: (process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "").toLowerCase(),
  nodeEnv: process.env.NODE_ENV || "development"
};

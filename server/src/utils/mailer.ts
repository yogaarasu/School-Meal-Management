import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import type { SchoolType } from "../types/domain.js";
import { ApiError } from "./apiError.js";

interface OrganizerWelcomeEmailInput {
  organizerId: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  schoolType: SchoolType;
  district: string;
  email: string;
  phone: string;
  temporaryPassword: string;
}

const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  PRIMARY: "Primary",
  MIDDLE: "Middle",
  HIGHER_SECONDARY: "Higher Secondary"
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getTransporter = () => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFromEmail) {
    throw new ApiError(500, "Email service is not configured. Please set SMTP environment variables.");
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
};

const buildWelcomeEmailHtml = (input: OrganizerWelcomeEmailInput): string => {
  const loginUrl = env.portalLoginUrl;
  const fullName = `${input.firstName} ${input.lastName}`;

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to TN School Meal Management</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#f1f5f9;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:28px 30px;background:linear-gradient(135deg,#0f766e,#0ea5e9);color:#ffffff;">
                <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.8px;text-transform:uppercase;opacity:0.9;">TN School Meal Management</p>
                <h1 style="margin:0;font-size:24px;line-height:1.3;">Welcome, ${escapeHtml(fullName)}</h1>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.6;opacity:0.95;">Your organizer account is ready. Please use the temporary credentials below to sign in and update your password after login.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 30px 8px;">
                <h2 style="margin:0 0 14px;font-size:16px;color:#0f172a;">Organizer Details</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="padding:10px 12px;background:#f8fafc;font-size:13px;color:#475569;width:42%;">Organizer ID</td>
                    <td style="padding:10px 12px;font-size:13px;color:#0f172a;">${escapeHtml(input.organizerId)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f8fafc;font-size:13px;color:#475569;">Email</td>
                    <td style="padding:10px 12px;font-size:13px;color:#0f172a;">${escapeHtml(input.email)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f8fafc;font-size:13px;color:#475569;">Phone</td>
                    <td style="padding:10px 12px;font-size:13px;color:#0f172a;">${escapeHtml(input.phone)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f8fafc;font-size:13px;color:#475569;">School Name</td>
                    <td style="padding:10px 12px;font-size:13px;color:#0f172a;">${escapeHtml(input.schoolName)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f8fafc;font-size:13px;color:#475569;">School Type</td>
                    <td style="padding:10px 12px;font-size:13px;color:#0f172a;">${escapeHtml(SCHOOL_TYPE_LABELS[input.schoolType])}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;background:#f8fafc;font-size:13px;color:#475569;">District</td>
                    <td style="padding:10px 12px;font-size:13px;color:#0f172a;">${escapeHtml(input.district)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 30px 0;">
                <h2 style="margin:0 0 12px;font-size:16px;color:#0f172a;">Temporary Login Credentials</h2>
                <div style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:10px;padding:14px;">
                  <p style="margin:0 0 8px;font-size:13px;color:#0f172a;"><strong>Username:</strong> ${escapeHtml(input.email)}</p>
                  <p style="margin:0;font-size:13px;color:#0f172a;"><strong>Temporary Password:</strong> ${escapeHtml(input.temporaryPassword)}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 30px 30px;">
                <a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:bold;">Sign In to Portal</a>
                <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#64748b;">For security, please change your password after your first login. If you did not expect this email, contact the administrator immediately.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const buildWelcomeEmailText = (input: OrganizerWelcomeEmailInput): string => {
  const loginUrl = env.portalLoginUrl;

  return [
    `Welcome ${input.firstName} ${input.lastName},`,
    "",
    "Your organizer account has been created in TN School Meal Management.",
    "",
    `Organizer ID: ${input.organizerId}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `School Name: ${input.schoolName}`,
    `School Type: ${SCHOOL_TYPE_LABELS[input.schoolType]}`,
    `District: ${input.district}`,
    "",
    "Temporary Login Credentials",
    `Username: ${input.email}`,
    `Temporary Password: ${input.temporaryPassword}`,
    "",
    `Sign in: ${loginUrl}`,
    "",
    "Please change your password after your first login."
  ].join("\n");
};

export const sendOrganizerWelcomeEmail = async (input: OrganizerWelcomeEmailInput): Promise<void> => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
    to: input.email,
    subject: "Welcome to TN School Meal Management - Organizer Account",
    text: buildWelcomeEmailText(input),
    html: buildWelcomeEmailHtml(input)
  });
};

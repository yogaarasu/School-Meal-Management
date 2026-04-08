import { DailyReportModel } from "../models/DailyReport.js";
import { OrganizerModel, type OrganizerDocument } from "../models/Organizer.js";
import { StockLedgerEntryModel } from "../models/StockLedgerEntry.js";
import { DISTRICT_RTO } from "../constants/shared.js";
import { STRICT_PASSWORD_REGEX } from "../constants/validation.js";
import type { OrganizerPayload, SchoolType } from "../types/domain.js";
import { ApiError } from "../utils/apiError.js";
import { sendOrganizerWelcomeEmail } from "../utils/mailer.js";
import { hashPassword } from "../utils/password.js";

export interface OrganizerCreateInput {
  firstName: string;
  lastName: string;
  schoolName: string;
  email: string;
  phone: string;
  schoolType: SchoolType;
  district: string;
  taluk?: string;
  town?: string;
  temporaryPassword: string;
}

export interface OrganizerUpdateInput {
  firstName: string;
  lastName: string;
  schoolName: string;
  email: string;
  phone: string;
  schoolType: SchoolType;
  district: string;
  taluk?: string;
  town?: string;
  temporaryPassword?: string;
}

const toPayload = (doc: OrganizerDocument): OrganizerPayload => ({
  id: doc.organizerId,
  firstName: doc.firstName,
  lastName: doc.lastName,
  schoolName: doc.schoolName,
  email: doc.email,
  phone: doc.phone,
  schoolType: doc.schoolType,
  district: doc.district,
  taluk: doc.taluk || "",
  town: doc.town || "",
  createdAt: doc.createdAt.toISOString()
});

const generateOrganizerId = async (district: string): Promise<string> => {
  const year = new Date().getFullYear().toString().slice(-2);
  const rto = DISTRICT_RTO[district] || "00";
  const count = await OrganizerModel.countDocuments({ district });
  return `${year}NMO${count + 1}${rto}`;
};

export const listOrganizers = async (): Promise<OrganizerPayload[]> => {
  const docs = await OrganizerModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => ({
    id: doc.organizerId,
    firstName: doc.firstName,
    lastName: doc.lastName,
    schoolName: doc.schoolName,
    email: doc.email,
    phone: doc.phone,
    schoolType: doc.schoolType,
    district: doc.district,
    taluk: doc.taluk || "",
    town: doc.town || "",
    createdAt: doc.createdAt.toISOString()
  }));
};

export const createOrganizer = async (
  payload: OrganizerCreateInput
): Promise<{ organizer: OrganizerPayload; generatedPassword: string }> => {
  const temporaryPassword = payload.temporaryPassword.trim();

  if (!STRICT_PASSWORD_REGEX.test(temporaryPassword)) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
    );
  }

  const organizerId = await generateOrganizerId(payload.district);
  const passwordHash = await hashPassword(temporaryPassword);

  const existing = await OrganizerModel.findOne({
    $or: [{ email: payload.email.toLowerCase() }, { organizerId }]
  });

  if (existing) {
    throw new ApiError(409, "Organizer with same email or ID already exists.");
  }

  const created = await OrganizerModel.create({
    organizerId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    schoolName: payload.schoolName,
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    schoolType: payload.schoolType,
    district: payload.district,
    taluk: payload.taluk || "",
    town: payload.town || "",
    passwordHash
  });

  try {
    await sendOrganizerWelcomeEmail({
      organizerId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      schoolName: payload.schoolName,
      schoolType: payload.schoolType,
      district: payload.district,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      temporaryPassword
    });
  } catch (_error) {
    await OrganizerModel.deleteOne({ _id: created._id });
    throw new ApiError(500, "Unable to send welcome email. Organizer was not created.");
  }

  return { organizer: toPayload(created), generatedPassword: temporaryPassword };
};

export const updateOrganizer = async (
  organizerId: string,
  payload: OrganizerUpdateInput
): Promise<OrganizerPayload> => {
  const organizer = await OrganizerModel.findOne({ organizerId });

  if (!organizer) {
    throw new ApiError(404, "Organizer not found.");
  }

  organizer.firstName = payload.firstName;
  organizer.lastName = payload.lastName;
  organizer.schoolName = payload.schoolName;
  organizer.email = payload.email.toLowerCase();
  organizer.phone = payload.phone;
  organizer.schoolType = payload.schoolType;
  organizer.district = payload.district;
  organizer.taluk = payload.taluk || "";
  organizer.town = payload.town || "";

  if (payload.temporaryPassword && payload.temporaryPassword.trim()) {
    const nextPassword = payload.temporaryPassword.trim();

    if (!STRICT_PASSWORD_REGEX.test(nextPassword)) {
      throw new ApiError(
        400,
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
    }

    organizer.passwordHash = await hashPassword(nextPassword);
  }

  await organizer.save();
  return toPayload(organizer);
};

export const deleteOrganizer = async (organizerId: string): Promise<void> => {
  const organizer = await OrganizerModel.findOne({ organizerId });

  if (!organizer) {
    throw new ApiError(404, "Organizer not found.");
  }

  await OrganizerModel.deleteOne({ organizerId });
  await DailyReportModel.deleteMany({ organizerId });
  await StockLedgerEntryModel.deleteMany({ organizerId });
};

export const getAdminDashboardStats = async (): Promise<{
  total: number;
  primary: number;
  middle: number;
  higher: number;
}> => {
  const [total, primary, middle, higher] = await Promise.all([
    OrganizerModel.countDocuments(),
    OrganizerModel.countDocuments({ schoolType: "PRIMARY" }),
    OrganizerModel.countDocuments({ schoolType: "MIDDLE" }),
    OrganizerModel.countDocuments({ schoolType: "HIGHER_SECONDARY" })
  ]);

  return { total, primary, middle, higher };
};
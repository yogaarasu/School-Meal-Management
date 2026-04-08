import { env } from "../config/env.js";
import { OrganizerModel } from "../models/Organizer.js";
import type { AuthUser, UserRole } from "../types/domain.js";
import { ApiError } from "../utils/apiError.js";
import { comparePassword } from "../utils/password.js";

export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
  const normalizedEmail = email.toLowerCase();

  if (normalizedEmail === env.adminEmail) {
    if (password === env.adminPassword) {
      return {
        id: "admin",
        role: "ADMIN",
        name: "State Administrator",
        email: env.adminEmail
      };
    }

    throw new ApiError(401, "Invalid email or password.");
  }

  const organizer = await OrganizerModel.findOne({ email: normalizedEmail });

  if (!organizer) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isValid = await comparePassword(password, organizer.passwordHash);

  if (!isValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  return {
    id: organizer.organizerId,
    role: "ORGANIZER",
    name: `${organizer.firstName} ${organizer.lastName}`,
    email: organizer.email,
    organizerData: {
      id: organizer.organizerId,
      firstName: organizer.firstName,
      lastName: organizer.lastName,
      schoolName: organizer.schoolName,
      email: organizer.email,
      phone: organizer.phone,
      schoolType: organizer.schoolType,
      district: organizer.district,
      taluk: organizer.taluk || "",
      town: organizer.town || "",
      createdAt: organizer.createdAt.toISOString()
    }
  };
};

export const getSessionUser = async (role: UserRole, id: string): Promise<AuthUser | null> => {
  if (role === "ADMIN") {
    return {
      id: "admin",
      role: "ADMIN",
      name: "State Administrator",
      email: env.adminEmail
    };
  }

  const organizer = await OrganizerModel.findOne({ organizerId: id });
  if (!organizer) {
    return null;
  }

  return {
    id: organizer.organizerId,
    role: "ORGANIZER",
    name: `${organizer.firstName} ${organizer.lastName}`,
    email: organizer.email,
    organizerData: {
      id: organizer.organizerId,
      firstName: organizer.firstName,
      lastName: organizer.lastName,
      schoolName: organizer.schoolName,
      email: organizer.email,
      phone: organizer.phone,
      schoolType: organizer.schoolType,
      district: organizer.district,
      taluk: organizer.taluk || "",
      town: organizer.town || "",
      createdAt: organizer.createdAt.toISOString()
    }
  };
};

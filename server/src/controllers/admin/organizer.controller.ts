import type { Request, Response } from "express";
import { z } from "zod";
import { STRICT_PASSWORD_HINT, STRICT_PASSWORD_REGEX } from "../../constants/validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createOrganizer,
  deleteOrganizer,
  getAdminDashboardStats,
  listOrganizers,
  updateOrganizer
} from "../../services/organizer.service.js";

const NAME_REGEX = /^[\p{L}]+$/u;
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

const strictPasswordSchema = z.string().trim().regex(STRICT_PASSWORD_REGEX, {
  message: STRICT_PASSWORD_HINT
});

const organizerBaseSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .regex(NAME_REGEX, "First name must contain only letters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .regex(NAME_REGEX, "Last name must contain only letters"),
  schoolName: z.string().trim().min(1, "School name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE_REGEX, "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"),
  schoolType: z.enum(["PRIMARY", "MIDDLE", "HIGHER_SECONDARY"]),
  district: z.string().trim().min(1, "District is required"),
  taluk: z.string().trim().optional(),
  town: z.string().trim().optional()
});

const createOrganizerSchema = organizerBaseSchema.extend({
  temporaryPassword: strictPasswordSchema
});

const updateOrganizerSchema = organizerBaseSchema.extend({
  temporaryPassword: strictPasswordSchema.optional()
});

export const dashboardStatsController = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getAdminDashboardStats();
  res.status(200).json({ stats });
});

export const listOrganizersController = asyncHandler(async (_req: Request, res: Response) => {
  const organizers = await listOrganizers();
  res.status(200).json({ organizers });
});

export const createOrganizerController = asyncHandler(async (req: Request, res: Response) => {
  const payload = createOrganizerSchema.parse(req.body);
  const created = await createOrganizer(payload);
  res.status(201).json(created);
});

export const updateOrganizerController = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateOrganizerSchema.parse(req.body);
  const organizer = await updateOrganizer(req.params.organizerId, payload);
  res.status(200).json({ organizer });
});

export const deleteOrganizerController = asyncHandler(async (req: Request, res: Response) => {
  await deleteOrganizer(req.params.organizerId);
  res.status(200).json({ message: "Organizer deleted" });
});
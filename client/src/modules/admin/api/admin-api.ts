import { http } from "@/lib/http";
import type { GlobalPricingConfig, Organizer } from "@/modules/shared/types/domain";

export interface OrganizerInput {
  firstName: string;
  lastName: string;
  schoolName: string;
  email: string;
  phone: string;
  schoolType: "PRIMARY" | "MIDDLE" | "HIGHER_SECONDARY";
  district: string;
  taluk?: string;
  town?: string;
  temporaryPassword?: string;
}

export const getAdminDashboard = () =>
  http<{ stats: { total: number; primary: number; middle: number; higher: number } }>("/api/admin/dashboard");

export const getOrganizers = () => http<{ organizers: Organizer[] }>("/api/admin/organizers");

export const createOrganizer = (payload: OrganizerInput) =>
  http<{ organizer: Organizer; generatedPassword: string }>("/api/admin/organizers", {
    method: "POST",
    body: payload
  });

export const updateOrganizer = (organizerId: string, payload: OrganizerInput) =>
  http<{ organizer: Organizer }>(`/api/admin/organizers/${organizerId}`, {
    method: "PUT",
    body: payload
  });

export const deleteOrganizer = (organizerId: string) =>
  http<{ message: string }>(`/api/admin/organizers/${organizerId}`, { method: "DELETE" });

export const getPricingConfig = () => http<{ config: GlobalPricingConfig }>("/api/admin/pricing");

export const updatePricingConfig = (config: GlobalPricingConfig) =>
  http<{ config: GlobalPricingConfig }>("/api/admin/pricing", {
    method: "PUT",
    body: config
  });
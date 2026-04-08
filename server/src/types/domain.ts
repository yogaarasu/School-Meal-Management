export const UserRole = {
  ADMIN: "ADMIN",
  ORGANIZER: "ORGANIZER"
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SchoolType = {
  PRIMARY: "PRIMARY",
  MIDDLE: "MIDDLE",
  HIGHER_SECONDARY: "HIGHER_SECONDARY"
} as const;

export type SchoolType = (typeof SchoolType)[keyof typeof SchoolType];

export type ReportSection = "PRIMARY" | "MIDDLE" | "ALL";

export interface PortionConfig {
  riceGrams: number;
  dalGrams: number;
  oilMl: number;
  chickpeasGrams: number;
  greenBeansGrams: number;
  vegPrice: number;
  groceryPrice: number;
  gasPrice: number;
}

export type GlobalPricingConfig = Record<SchoolType, PortionConfig>;

export interface OrganizerPayload {
  id: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  email: string;
  phone: string;
  schoolType: SchoolType;
  district: string;
  taluk: string;
  town: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  organizerData?: OrganizerPayload;
}

export interface DailyReportItem {
  itemId: string;
  quantity: number;
}

export interface DailyReportPayload {
  id: string;
  organizerId: string;
  date: string;
  mealId: string;
  section: ReportSection;
  studentsPresent: number;
  students1to5: number;
  students6to8: number;
  itemsUsed: DailyReportItem[];
  totalCost: number;
  costBreakdown: {
    veg: number;
    grocery: number;
    gas: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StockLedgerPayload {
  id: string;
  organizerId: string;
  date: string;
  itemId: string;
  quantity: number;
  type: "IN" | "OUT";
  description?: string;
  reportId?: string;
  createdAt: string;
}

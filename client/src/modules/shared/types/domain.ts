export enum UserRole {
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER"
}

export enum SchoolType {
  PRIMARY = "PRIMARY",
  MIDDLE = "MIDDLE",
  HIGHER_SECONDARY = "HIGHER_SECONDARY"
}

export interface Organizer {
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
  organizerData?: Organizer;
}

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

export interface DailyReport {
  id: string;
  organizerId: string;
  date: string;
  mealId: string;
  section: "PRIMARY" | "MIDDLE" | "ALL";
  studentsPresent: number;
  students1to5: number;
  students6to8: number;
  itemsUsed: Array<{ itemId: string; quantity: number }>;
  totalCost: number;
  costBreakdown: {
    veg: number;
    grocery: number;
    gas: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StockLedgerEntry {
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

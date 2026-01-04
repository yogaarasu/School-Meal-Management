
export enum UserRole {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER'
}

export enum SchoolType {
  PRIMARY = 'Primary (1-5)',
  MIDDLE = 'Middle (6-8)',
  HIGHER_SECONDARY = 'High/Higher Secondary (6-12)'
}

export const SchoolTypeLabels: Record<string, { en: string; ta: string }> = {
  [SchoolType.PRIMARY]: { en: 'Primary (1-5)', ta: 'தொடக்கப்பள்ளி (1-5)' },
  [SchoolType.MIDDLE]: { en: 'Middle (6-8)', ta: 'நடுநிலைப்பள்ளி (6-8)' },
  [SchoolType.HIGHER_SECONDARY]: { en: 'High/Higher Secondary (6-12)', ta: 'உயர்/மேல்நிலைப்பள்ளி (6-12)' }
};

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

export interface District {
  name: string;
  nameEn: string;
  rto: string;
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
  password: string;
  createdAt: string;
}

export interface StockLedgerEntry {
  id: string;
  organizerId: string;
  date: string;
  itemId: string;
  quantity: number;
  type: 'IN' | 'OUT';
  description?: string;
}

export interface Meal {
  id: string;
  nameEn: string;
  nameTa: string;
}

export interface DailyReport {
  id: string;
  organizerId: string;
  date: string;
  mealId: string;
  section: 'PRIMARY' | 'MIDDLE' | 'ALL';
  studentsPresent: number;
  students1to5: number;
  students6to8: number;
  itemsUsed: {
    itemId: string;
    quantity: number;
  }[];
  totalCost: number;
  costBreakdown?: {
    veg: number;
    grocery: number;
    gas: number;
  };
}

export interface AuthState {
  user: {
    id: string;
    role: UserRole;
    name: string;
    organizerData?: Organizer;
  } | null;
}

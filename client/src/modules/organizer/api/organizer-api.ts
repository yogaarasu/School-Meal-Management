import { http } from "@/lib/http";
import type { DailyReport, GlobalPricingConfig, StockLedgerEntry } from "@/modules/shared/types/domain";

export interface ReportInput {
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
}

export interface StockInput {
  date: string;
  itemId: string;
  quantity: number;
  description?: string;
}

export const getOrganizerDashboard = () =>
  http<{ summary: { totalPrimary: number; totalMiddle: number; totalAll: number } }>("/api/organizer/dashboard");

export const getOrganizerPricing = () => http<{ config: GlobalPricingConfig }>("/api/organizer/pricing");

export const getReports = () => http<{ reports: DailyReport[] }>("/api/organizer/reports");

export const createReport = (payload: ReportInput) =>
  http<{ report: DailyReport }>("/api/organizer/reports", { method: "POST", body: payload });

export const updateReport = (reportId: string, payload: ReportInput) =>
  http<{ report: DailyReport }>(`/api/organizer/reports/${reportId}`, { method: "PUT", body: payload });

export const deleteReport = (reportId: string) =>
  http<{ message: string }>(`/api/organizer/reports/${reportId}`, { method: "DELETE" });

export const getStockLedger = () => http<{ ledger: StockLedgerEntry[] }>("/api/organizer/stock");

export const addStockEntry = (payload: StockInput) =>
  http<{ entry: StockLedgerEntry }>("/api/organizer/stock", { method: "POST", body: payload });

export const deleteStockEntry = (entryId: string) =>
  http<{ message: string }>(`/api/organizer/stock/${entryId}`, { method: "DELETE" });

export const getMonthlyReport = (month: string) =>
  http<{
    report: Array<{
      id: string;
      nameEn: string;
      nameTa: string;
      unitEn: string;
      unitTa: string;
      starting: number;
      added: number;
      spent: number;
      remaining: number;
    }>;
  }>(`/api/organizer/monthly-report?month=${month}`);
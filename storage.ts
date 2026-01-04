
import { Organizer, GlobalPricingConfig, StockLedgerEntry, DailyReport, Meal } from './types';
import { DEFAULT_PRICING_CONFIG } from './constants';

const KEYS = {
  ORGANIZERS: 'tn_nmo_organizers_v4',
  PRICING: 'tn_nmo_pricing_v4',
  STOCK: 'tn_nmo_stock_ledger_v4',
  REPORTS: 'tn_nmo_daily_reports_v4',
  /**
   * Fix: Added MEALS key for local storage persistence.
   */
  MEALS: 'tn_nmo_meals_v4'
};

export const getOrganizers = (): Organizer[] => {
  const data = localStorage.getItem(KEYS.ORGANIZERS);
  return data ? JSON.parse(data) : [];
};

export const saveOrganizers = (data: Organizer[]) => {
  localStorage.setItem(KEYS.ORGANIZERS, JSON.stringify(data));
};

export const getPricingConfig = (): GlobalPricingConfig => {
  const data = localStorage.getItem(KEYS.PRICING);
  return data ? JSON.parse(data) : DEFAULT_PRICING_CONFIG;
};

export const savePricingConfig = (data: GlobalPricingConfig) => {
  localStorage.setItem(KEYS.PRICING, JSON.stringify(data));
};

export const getStockLedger = (): StockLedgerEntry[] => {
  const data = localStorage.getItem(KEYS.STOCK);
  return data ? JSON.parse(data) : [];
};

export const saveStockLedger = (data: StockLedgerEntry[]) => {
  localStorage.setItem(KEYS.STOCK, JSON.stringify(data));
};

export const getDailyReports = (): DailyReport[] => {
  const data = localStorage.getItem(KEYS.REPORTS);
  return data ? JSON.parse(data) : [];
};

export const saveDailyReports = (data: DailyReport[]) => {
  localStorage.setItem(KEYS.REPORTS, JSON.stringify(data));
};

/**
 * Fix: Added getMeals function to retrieve meal data from storage.
 */
export const getMeals = (): Meal[] => {
  const data = localStorage.getItem(KEYS.MEALS);
  return data ? JSON.parse(data) : [];
};

/**
 * Fix: Added saveMeals function to persist meal data to storage.
 */
export const saveMeals = (data: Meal[]) => {
  localStorage.setItem(KEYS.MEALS, JSON.stringify(data));
};

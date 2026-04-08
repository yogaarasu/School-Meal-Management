import { STOCK_ITEMS } from "../constants/shared.js";
import { StockLedgerEntryModel } from "../models/StockLedgerEntry.js";
import type { StockLedgerPayload } from "../types/domain.js";
import { ApiError } from "../utils/apiError.js";

export interface StockInput {
  date: string;
  itemId: string;
  quantity: number;
  description?: string;
}

const toPayload = (doc: any): StockLedgerPayload => ({
  id: doc._id.toString(),
  organizerId: doc.organizerId,
  date: doc.date,
  itemId: doc.itemId,
  quantity: doc.quantity,
  type: doc.type,
  description: doc.description || "",
  reportId: doc.reportId,
  createdAt: doc.createdAt.toISOString()
});

export const getStockLedger = async (organizerId: string): Promise<StockLedgerPayload[]> => {
  const docs = await StockLedgerEntryModel.find({ organizerId }).sort({ date: -1, createdAt: -1 });
  return docs.map(toPayload);
};

export const addStockEntry = async (organizerId: string, input: StockInput): Promise<StockLedgerPayload> => {
  const created = await StockLedgerEntryModel.create({
    organizerId,
    date: input.date,
    itemId: input.itemId,
    quantity: input.quantity,
    type: "IN",
    description: input.description || ""
  });

  return toPayload(created);
};

export const deleteStockEntry = async (organizerId: string, entryId: string): Promise<void> => {
  const entry = await StockLedgerEntryModel.findOne({ _id: entryId, organizerId });

  if (!entry) {
    throw new ApiError(404, "Stock entry not found.");
  }

  await StockLedgerEntryModel.deleteOne({ _id: entryId, organizerId });
};

export const getMonthlyReport = async (
  organizerId: string,
  selectedMonth: string
): Promise<Array<{ id: string; nameEn: string; nameTa: string; unitEn: string; unitTa: string; starting: number; added: number; spent: number; remaining: number }>> => {
  const ledger = await StockLedgerEntryModel.find({ organizerId }).lean();
  const startDate = `${selectedMonth}-01`;

  return STOCK_ITEMS.filter((item) => ["rice", "dal", "oil", "chickpeas", "greenBeans"].includes(item.id)).map((item) => {
    const starting = ledger
      .filter((entry) => entry.itemId === item.id && entry.date < startDate)
      .reduce((sum, entry) => (entry.type === "IN" ? sum + entry.quantity : sum - entry.quantity), 0);

    const added = ledger
      .filter((entry) => entry.itemId === item.id && entry.date.startsWith(selectedMonth) && entry.type === "IN")
      .reduce((sum, entry) => sum + entry.quantity, 0);

    const spent = ledger
      .filter((entry) => entry.itemId === item.id && entry.date.startsWith(selectedMonth) && entry.type === "OUT")
      .reduce((sum, entry) => sum + entry.quantity, 0);

    return {
      id: item.id,
      nameEn: item.nameEn,
      nameTa: item.nameTa,
      unitEn: item.unitEn,
      unitTa: item.unitTa,
      starting: Math.max(0, starting),
      added,
      spent,
      remaining: Math.max(0, starting + added - spent)
    };
  });
};
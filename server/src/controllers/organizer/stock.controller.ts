import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { addStockEntry, deleteStockEntry, getMonthlyReport, getStockLedger } from "../../services/stock.service.js";

const addStockSchema = z.object({
  date: z.string().min(1),
  itemId: z.string().min(1),
  quantity: z.number().gt(0),
  description: z.string().optional()
});

export const listStockController = asyncHandler(async (req: Request, res: Response) => {
  const ledger = await getStockLedger(req.auth!.id);
  res.status(200).json({ ledger });
});

export const addStockController = asyncHandler(async (req: Request, res: Response) => {
  const payload = addStockSchema.parse(req.body);
  const entry = await addStockEntry(req.auth!.id, payload);
  res.status(201).json({ entry });
});

export const deleteStockController = asyncHandler(async (req: Request, res: Response) => {
  await deleteStockEntry(req.auth!.id, req.params.entryId);
  res.status(200).json({ message: "Stock entry deleted" });
});

export const monthlyReportController = asyncHandler(async (req: Request, res: Response) => {
  const month = z.string().regex(/^\d{4}-\d{2}$/).parse(req.query.month);
  const report = await getMonthlyReport(req.auth!.id, month);
  res.status(200).json({ report });
});
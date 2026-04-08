import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createReport, deleteReport, getReportsByOrganizer, updateReport } from "../../services/report.service.js";

const reportSchema = z.object({
  date: z.string().min(1),
  mealId: z.string().min(1),
  section: z.enum(["PRIMARY", "MIDDLE", "ALL"]),
  studentsPresent: z.number().min(0),
  students1to5: z.number().min(0),
  students6to8: z.number().min(0),
  itemsUsed: z.array(z.object({ itemId: z.string().min(1), quantity: z.number().min(0) })),
  totalCost: z.number().min(0),
  costBreakdown: z.object({
    veg: z.number().min(0),
    grocery: z.number().min(0),
    gas: z.number().min(0)
  })
});

export const listReportsController = asyncHandler(async (req: Request, res: Response) => {
  const reports = await getReportsByOrganizer(req.auth!.id);
  res.status(200).json({ reports });
});

export const createReportController = asyncHandler(async (req: Request, res: Response) => {
  const payload = reportSchema.parse(req.body);
  const report = await createReport(req.auth!.id, payload);
  res.status(201).json({ report });
});

export const updateReportController = asyncHandler(async (req: Request, res: Response) => {
  const payload = reportSchema.parse(req.body);
  const report = await updateReport(req.auth!.id, req.params.reportId, payload);
  res.status(200).json({ report });
});

export const deleteReportController = asyncHandler(async (req: Request, res: Response) => {
  await deleteReport(req.auth!.id, req.params.reportId);
  res.status(200).json({ message: "Report deleted" });
});
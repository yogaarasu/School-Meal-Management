import type { Request, Response } from "express";
import { DailyReportModel } from "../../models/DailyReport.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const organizerDashboardController = asyncHandler(async (req: Request, res: Response) => {
  const organizerId = req.auth!.id;

  const reports = await DailyReportModel.find({ organizerId }).lean();

  const summary = reports.reduce(
    (acc, report) => {
      acc.totalPrimary += report.students1to5;
      acc.totalMiddle += report.students6to8;
      acc.totalAll += report.studentsPresent;
      return acc;
    },
    { totalPrimary: 0, totalMiddle: 0, totalAll: 0 }
  );

  res.status(200).json({ summary });
});
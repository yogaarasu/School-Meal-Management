import { DailyReportModel } from "../models/DailyReport.js";
import { OrganizerModel } from "../models/Organizer.js";
import { StockLedgerEntryModel } from "../models/StockLedgerEntry.js";
import type { DailyReportPayload } from "../types/domain.js";
import { ApiError } from "../utils/apiError.js";

export interface ReportInput {
  date: string;
  mealId: string;
  section: "PRIMARY" | "MIDDLE" | "ALL";
  studentsPresent: number;
  students1to5: number;
  students6to8: number;
  itemsUsed: Array<{ itemId: string; quantity: number }>;
  totalCost: number;
  costBreakdown: { veg: number; grocery: number; gas: number };
}

const toPayload = (doc: any): DailyReportPayload => ({
  id: doc._id.toString(),
  organizerId: doc.organizerId,
  date: doc.date,
  mealId: doc.mealId,
  section: doc.section,
  studentsPresent: doc.studentsPresent,
  students1to5: doc.students1to5,
  students6to8: doc.students6to8,
  itemsUsed: doc.itemsUsed,
  totalCost: doc.totalCost,
  costBreakdown: doc.costBreakdown,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString()
});

const syncStockForReport = async (
  organizerId: string,
  reportId: string,
  date: string,
  section: string,
  itemsUsed: Array<{ itemId: string; quantity: number }>
): Promise<void> => {
  await StockLedgerEntryModel.deleteMany({ organizerId, reportId });

  if (itemsUsed.length === 0) {
    return;
  }

  await StockLedgerEntryModel.insertMany(
    itemsUsed
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        organizerId,
        reportId,
        date,
        itemId: item.itemId,
        quantity: item.quantity,
        type: "OUT",
        description: `Daily usage (${section})`
      }))
  );
};

const ensureSectionAllowed = async (organizerId: string, section: string): Promise<void> => {
  const organizer = await OrganizerModel.findOne({ organizerId }).select({ schoolType: 1, _id: 0 });

  if (!organizer) {
    throw new ApiError(404, "Organizer not found.");
  }

  if (organizer.schoolType === "MIDDLE") {
    if (section !== "PRIMARY" && section !== "MIDDLE") {
      throw new ApiError(400, "Middle school organizers can submit only PRIMARY or MIDDLE reports.");
    }
    return;
  }

  if (section !== "ALL") {
    throw new ApiError(400, "This organizer can submit only ALL section reports.");
  }
};

const ensureDuplicateRule = async (
  organizerId: string,
  date: string,
  section: string,
  excludeId?: string
): Promise<void> => {
  const duplicate = await DailyReportModel.findOne({
    organizerId,
    date,
    section,
    ...(excludeId ? { _id: { $ne: excludeId } } : {})
  });

  if (duplicate) {
    throw new ApiError(409, "A report for this date and section already exists.");
  }
};

export const getReportsByOrganizer = async (organizerId: string): Promise<DailyReportPayload[]> => {
  const docs = await DailyReportModel.find({ organizerId }).sort({ date: -1, createdAt: -1 });
  return docs.map(toPayload);
};

export const createReport = async (organizerId: string, input: ReportInput): Promise<DailyReportPayload> => {
  await ensureSectionAllowed(organizerId, input.section);
  await ensureDuplicateRule(organizerId, input.date, input.section);

  const report = await DailyReportModel.create({
    organizerId,
    date: input.date,
    mealId: input.mealId,
    section: input.section,
    studentsPresent: input.studentsPresent,
    students1to5: input.students1to5,
    students6to8: input.students6to8,
    itemsUsed: input.itemsUsed,
    totalCost: input.totalCost,
    costBreakdown: input.costBreakdown
  });

  await syncStockForReport(organizerId, report._id.toString(), input.date, input.section, input.itemsUsed);
  return toPayload(report);
};

export const updateReport = async (
  organizerId: string,
  reportId: string,
  input: ReportInput
): Promise<DailyReportPayload> => {
  const report = await DailyReportModel.findOne({ _id: reportId, organizerId });

  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  await ensureSectionAllowed(organizerId, input.section);
  await ensureDuplicateRule(organizerId, input.date, input.section, reportId);

  report.date = input.date;
  report.mealId = input.mealId;
  report.section = input.section;
  report.studentsPresent = input.studentsPresent;
  report.students1to5 = input.students1to5;
  report.students6to8 = input.students6to8;
  (report as any).itemsUsed = input.itemsUsed;
  report.totalCost = input.totalCost;
  report.costBreakdown = input.costBreakdown;

  await report.save();
  await syncStockForReport(organizerId, reportId, input.date, input.section, input.itemsUsed);

  return toPayload(report);
};

export const deleteReport = async (organizerId: string, reportId: string): Promise<void> => {
  const report = await DailyReportModel.findOne({ _id: reportId, organizerId });

  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  await DailyReportModel.deleteOne({ _id: reportId, organizerId });
  await StockLedgerEntryModel.deleteMany({ organizerId, reportId });
};

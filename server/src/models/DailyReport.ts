import { Schema, model, type InferSchemaType } from "mongoose";

const dailyReportSchema = new Schema(
  {
    organizerId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    mealId: { type: String, required: true, default: "standard_meal" },
    section: { type: String, enum: ["PRIMARY", "MIDDLE", "ALL"], required: true },
    studentsPresent: { type: Number, required: true },
    students1to5: { type: Number, required: true },
    students6to8: { type: Number, required: true },
    itemsUsed: [
      {
        itemId: { type: String, required: true },
        quantity: { type: Number, required: true }
      }
    ],
    totalCost: { type: Number, required: true },
    costBreakdown: {
      veg: { type: Number, required: true },
      grocery: { type: Number, required: true },
      gas: { type: Number, required: true }
    }
  },
  { timestamps: true, collection: "daily_reports" }
);

dailyReportSchema.index({ organizerId: 1, date: 1, section: 1 }, { unique: true });

export type DailyReportDocument = InferSchemaType<typeof dailyReportSchema>;
export const DailyReportModel = model("DailyReport", dailyReportSchema);

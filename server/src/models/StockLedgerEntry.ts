import { Schema, model, type InferSchemaType } from "mongoose";

const stockLedgerEntrySchema = new Schema(
  {
    organizerId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    itemId: { type: String, required: true, index: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ["IN", "OUT"], required: true },
    description: { type: String, default: "" },
    reportId: { type: String, index: true }
  },
  { timestamps: true, collection: "stock_ledger_entries" }
);

stockLedgerEntrySchema.index({ organizerId: 1, date: -1 });

export type StockLedgerEntryDocument = InferSchemaType<typeof stockLedgerEntrySchema>;
export const StockLedgerEntryModel = model("StockLedgerEntry", stockLedgerEntrySchema);

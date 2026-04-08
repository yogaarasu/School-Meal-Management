import mongoose from "mongoose";
import { env } from "./env.js";

const migrateLegacyCollections = async (): Promise<void> => {
  const db = mongoose.connection.db;

  if (!db) {
    return;
  }

  const migrations = [
    { from: "dailyreports", to: "daily_reports" },
    { from: "stockledgerentries", to: "stock_ledger_entries" },
    { from: "pricingconfigs", to: "pricing_configs" }
  ] as const;

  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  const names = new Set(collections.map((collection) => collection.name));

  for (const { from, to } of migrations) {
    if (!names.has(from)) {
      continue;
    }

    const targetCount = await db.collection(to).estimatedDocumentCount();
    if (targetCount > 0) {
      continue;
    }

    const legacyDocs = await db.collection(from).find({}).toArray();
    if (legacyDocs.length === 0) {
      continue;
    }

    await db.collection(to).insertMany(legacyDocs, { ordered: false });
    // eslint-disable-next-line no-console
    console.log(`Migrated ${legacyDocs.length} documents from ${from} to ${to}`);
  }
};

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.mongodbUri);
  await migrateLegacyCollections();
};

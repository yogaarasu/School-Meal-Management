import { app } from "../src/app.js";
import { connectDatabase } from "../src/config/database.js";
import { ensurePricingConfig } from "../src/services/pricing.service.js";

let bootstrapPromise: Promise<void> | null = null;

const ensureBootstrapped = (): Promise<void> => {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await connectDatabase();
      await ensurePricingConfig();
    })();
  }

  return bootstrapPromise;
};

export default async function handler(req: any, res: any): Promise<void> {
  await ensureBootstrapped();
  app(req, res);
}

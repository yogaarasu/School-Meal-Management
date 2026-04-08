import { DEFAULT_PRICING_CONFIG } from "../constants/shared.js";
import { PricingConfigModel } from "../models/PricingConfig.js";
import type { GlobalPricingConfig } from "../types/domain.js";

const GLOBAL_KEY = "global";

export const ensurePricingConfig = async (): Promise<void> => {
  const existing = await PricingConfigModel.findOne({ key: GLOBAL_KEY });
  if (!existing) {
    await PricingConfigModel.create({ key: GLOBAL_KEY, configs: DEFAULT_PRICING_CONFIG });
  }
};

export const getPricingConfig = async (): Promise<GlobalPricingConfig> => {
  const config = await PricingConfigModel.findOne({ key: GLOBAL_KEY });
  if (!config) {
    await ensurePricingConfig();
    return DEFAULT_PRICING_CONFIG;
  }
  return config.configs as GlobalPricingConfig;
};

export const updatePricingConfig = async (configs: GlobalPricingConfig): Promise<GlobalPricingConfig> => {
  const updated = await PricingConfigModel.findOneAndUpdate(
    { key: GLOBAL_KEY },
    { key: GLOBAL_KEY, configs },
    { new: true, upsert: true }
  );

  return updated.configs as GlobalPricingConfig;
};
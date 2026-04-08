import type { Request, Response } from "express";
import { getPricingConfig } from "../../services/pricing.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const organizerPricingController = asyncHandler(async (_req: Request, res: Response) => {
  const config = await getPricingConfig();
  res.status(200).json({ config });
});
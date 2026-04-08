import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPricingConfig, updatePricingConfig } from "../../services/pricing.service.js";

const pricingSchema = z.object({
  PRIMARY: z.object({
    riceGrams: z.number(),
    dalGrams: z.number(),
    oilMl: z.number(),
    chickpeasGrams: z.number(),
    greenBeansGrams: z.number(),
    vegPrice: z.number(),
    groceryPrice: z.number(),
    gasPrice: z.number()
  }),
  MIDDLE: z.object({
    riceGrams: z.number(),
    dalGrams: z.number(),
    oilMl: z.number(),
    chickpeasGrams: z.number(),
    greenBeansGrams: z.number(),
    vegPrice: z.number(),
    groceryPrice: z.number(),
    gasPrice: z.number()
  }),
  HIGHER_SECONDARY: z.object({
    riceGrams: z.number(),
    dalGrams: z.number(),
    oilMl: z.number(),
    chickpeasGrams: z.number(),
    greenBeansGrams: z.number(),
    vegPrice: z.number(),
    groceryPrice: z.number(),
    gasPrice: z.number()
  })
});

export const getPricingController = asyncHandler(async (_req: Request, res: Response) => {
  const config = await getPricingConfig();
  res.status(200).json({ config });
});

export const updatePricingController = asyncHandler(async (req: Request, res: Response) => {
  const config = pricingSchema.parse(req.body);
  const updated = await updatePricingConfig(config);
  res.status(200).json({ config: updated });
});
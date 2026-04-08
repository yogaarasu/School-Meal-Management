import { Schema, model, type InferSchemaType } from "mongoose";

const pricingConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    configs: {
      PRIMARY: {
        riceGrams: { type: Number, required: true },
        dalGrams: { type: Number, required: true },
        oilMl: { type: Number, required: true },
        chickpeasGrams: { type: Number, required: true },
        greenBeansGrams: { type: Number, required: true },
        vegPrice: { type: Number, required: true },
        groceryPrice: { type: Number, required: true },
        gasPrice: { type: Number, required: true }
      },
      MIDDLE: {
        riceGrams: { type: Number, required: true },
        dalGrams: { type: Number, required: true },
        oilMl: { type: Number, required: true },
        chickpeasGrams: { type: Number, required: true },
        greenBeansGrams: { type: Number, required: true },
        vegPrice: { type: Number, required: true },
        groceryPrice: { type: Number, required: true },
        gasPrice: { type: Number, required: true }
      },
      HIGHER_SECONDARY: {
        riceGrams: { type: Number, required: true },
        dalGrams: { type: Number, required: true },
        oilMl: { type: Number, required: true },
        chickpeasGrams: { type: Number, required: true },
        greenBeansGrams: { type: Number, required: true },
        vegPrice: { type: Number, required: true },
        groceryPrice: { type: Number, required: true },
        gasPrice: { type: Number, required: true }
      }
    }
  },
  { timestamps: true, collection: "pricing_configs" }
);

export type PricingConfigDocument = InferSchemaType<typeof pricingConfigSchema>;
export const PricingConfigModel = model("PricingConfig", pricingConfigSchema);


import { District, SchoolType, GlobalPricingConfig, PortionConfig } from './types';

export const TAMIL_NADU_DISTRICTS: District[] = [
  { name: 'அரியலூர்', nameEn: 'Ariyalur', rto: '61' },
  { name: 'சென்னை', nameEn: 'Chennai', rto: '01' },
  { name: 'மதுரை', nameEn: 'Madurai', rto: '58' },
  { name: 'கோயம்புத்தூர்', nameEn: 'Coimbatore', rto: '37' },
  { name: 'திருச்சிராப்பள்ளி', nameEn: 'Tiruchirappalli', rto: '45' },
];

export const STOCK_ITEMS = [
  { id: 'rice', nameEn: 'Rice', nameTa: 'அரிசி', unitEn: 'kg', unitTa: 'கிலோ' },
  { id: 'dal', nameEn: 'Dal', nameTa: 'பருப்பு', unitEn: 'kg', unitTa: 'கிலோ' },
  { id: 'oil', nameEn: 'Oil', nameTa: 'எண்ணெய்', unitEn: 'L', unitTa: 'லிட்டர்' },
  { id: 'chickpeas', nameEn: 'Chickpeas', nameTa: 'கொண்டைக்கடலை', unitEn: 'kg', unitTa: 'கிலோ' },
  { id: 'greenBeans', nameEn: 'Green Beans', nameTa: 'பச்சைப்பயறு', unitEn: 'kg', unitTa: 'கிலோ' },
  { id: 'veg', nameEn: 'Vegetables', nameTa: 'காயக்கறிகள்', unitEn: 'kg', unitTa: 'கிலோ' },
  { id: 'grocery', nameEn: 'Grocery', nameTa: 'மளிகை', unitEn: 'nos', unitTa: 'பெட்டி' },
  { id: 'gas', nameEn: 'Gas', nameTa: 'எரிவாயு', unitEn: 'nos', unitTa: 'எண்ணிக்கை' },
];

/**
 * Fix: Added INITIAL_MEALS to provide default meal plan data.
 */
export const INITIAL_MEALS = [
  { id: 'standard_meal', nameEn: 'Standard Lunch', nameTa: 'சாதாரண மதிய உணவு' },
  { id: 'variety_rice', nameEn: 'Variety Rice', nameTa: 'கலவை சாதம்' },
  { id: 'nutritious_meal', nameEn: 'Nutritious Meal', nameTa: 'சத்தான உணவு' },
];

const createDefaultPortion = (): PortionConfig => ({
  riceGrams: 100,
  dalGrams: 15,
  oilMl: 5,
  chickpeasGrams: 20,
  greenBeansGrams: 20,
  vegPrice: 2.5,
  groceryPrice: 1.5,
  gasPrice: 1.0,
});

export const DEFAULT_PRICING_CONFIG: GlobalPricingConfig = {
  [SchoolType.PRIMARY]: { ...createDefaultPortion() },
  [SchoolType.MIDDLE]: { ...createDefaultPortion(), riceGrams: 150, dalGrams: 20 },
  [SchoolType.HIGHER_SECONDARY]: { ...createDefaultPortion(), riceGrams: 200, dalGrams: 25 },
};

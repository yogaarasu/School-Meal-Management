import { GlobalPricingConfig, SchoolType } from "../types/domain.js";

export const DISTRICT_RTO: Record<string, string> = {
  Ariyalur: "61",
  Chengalpattu: "19",
  Chennai: "01",
  Coimbatore: "37",
  Cuddalore: "31",
  Dharmapuri: "29",
  Dindigul: "57",
  Erode: "33",
  Kallakurichi: "15",
  Kancheepuram: "21",
  Kanniyakumari: "74",
  Karur: "47",
  Krishnagiri: "24",
  Madurai: "58",
  Mayiladuthurai: "82",
  Nagapattinam: "51",
  Namakkal: "28",
  Nilgiris: "43",
  Perambalur: "46",
  Pudukkottai: "55",
  Ramanathapuram: "65",
  Ranipet: "73",
  Salem: "30",
  Sivaganga: "63",
  Tenkasi: "76",
  Thanjavur: "49",
  Theni: "60",
  Thoothukudi: "69",
  Tiruchirappalli: "45",
  Tirunelveli: "72",
  Tirupattur: "83",
  Tiruppur: "39",
  Tiruvallur: "20",
  Tiruvannamalai: "25",
  Tiruvarur: "50",
  Vellore: "23",
  Viluppuram: "32",
  Virudhunagar: "67"
};

export const STOCK_ITEMS = [
  { id: "rice", nameEn: "Rice", nameTa: "அரிசி", unitEn: "kg", unitTa: "கிலோ" },
  { id: "dal", nameEn: "Dal", nameTa: "பருப்பு", unitEn: "kg", unitTa: "கிலோ" },
  { id: "oil", nameEn: "Oil", nameTa: "எண்ணெய்", unitEn: "L", unitTa: "லிட்டர்" },
  { id: "chickpeas", nameEn: "Chickpeas", nameTa: "கொண்டைக்கடலை", unitEn: "kg", unitTa: "கிலோ" },
  { id: "greenBeans", nameEn: "Green Beans", nameTa: "பச்சைப்பயறு", unitEn: "kg", unitTa: "கிலோ" },
  { id: "veg", nameEn: "Vegetables", nameTa: "காய்கறிகள்", unitEn: "kg", unitTa: "கிலோ" },
  { id: "grocery", nameEn: "Grocery", nameTa: "மளிகை", unitEn: "nos", unitTa: "எண்ணிக்கை" },
  { id: "gas", nameEn: "Gas", nameTa: "எரிவாயு", unitEn: "nos", unitTa: "எண்ணிக்கை" }
];

const baseConfig = {
  riceGrams: 100,
  dalGrams: 15,
  oilMl: 5,
  chickpeasGrams: 20,
  greenBeansGrams: 20,
  vegPrice: 2.5,
  groceryPrice: 1.5,
  gasPrice: 1
};

export const DEFAULT_PRICING_CONFIG: GlobalPricingConfig = {
  [SchoolType.PRIMARY]: { ...baseConfig },
  [SchoolType.MIDDLE]: { ...baseConfig, riceGrams: 150, dalGrams: 20 },
  [SchoolType.HIGHER_SECONDARY]: { ...baseConfig, riceGrams: 200, dalGrams: 25 }
};

export const SESSION_COOKIE_NAME = "tn_nmo_session";

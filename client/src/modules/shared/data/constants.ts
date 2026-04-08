import { SchoolType } from "../types/domain";

export const SCHOOL_TYPE_LABELS: Record<SchoolType, { en: string; ta: string }> = {
  [SchoolType.PRIMARY]: { en: "Primary (1-5)", ta: "தொடக்கப்பள்ளி (1-5)" },
  [SchoolType.MIDDLE]: { en: "Middle (6-8)", ta: "நடுநிலைப்பள்ளி (6-8)" },
  [SchoolType.HIGHER_SECONDARY]: { en: "High/Higher Secondary (6-12)", ta: "உயர்/மேல்நிலைப்பள்ளி (6-12)" }
};

export const DISTRICTS = [
  { nameEn: "Ariyalur", nameTa: "அரியலூர்" },
  { nameEn: "Chengalpattu", nameTa: "செங்கல்பட்டு" },
  { nameEn: "Chennai", nameTa: "சென்னை" },
  { nameEn: "Coimbatore", nameTa: "கோயம்புத்தூர்" },
  { nameEn: "Cuddalore", nameTa: "கடலூர்" },
  { nameEn: "Dharmapuri", nameTa: "தர்மபுரி" },
  { nameEn: "Dindigul", nameTa: "திண்டுக்கல்" },
  { nameEn: "Erode", nameTa: "ஈரோடு" },
  { nameEn: "Kallakurichi", nameTa: "கள்ளக்குறிச்சி" },
  { nameEn: "Kancheepuram", nameTa: "காஞ்சிபுரம்" },
  { nameEn: "Kanniyakumari", nameTa: "கன்னியாகுமரி" },
  { nameEn: "Karur", nameTa: "கரூர்" },
  { nameEn: "Krishnagiri", nameTa: "கிருஷ்ணகிரி" },
  { nameEn: "Madurai", nameTa: "மதுரை" },
  { nameEn: "Mayiladuthurai", nameTa: "மயிலாடுதுறை" },
  { nameEn: "Nagapattinam", nameTa: "நாகப்பட்டினம்" },
  { nameEn: "Namakkal", nameTa: "நாமக்கல்" },
  { nameEn: "Nilgiris", nameTa: "நீலகிரி" },
  { nameEn: "Perambalur", nameTa: "பெரம்பலூர்" },
  { nameEn: "Pudukkottai", nameTa: "புதுக்கோட்டை" },
  { nameEn: "Ramanathapuram", nameTa: "ராமநாதபுரம்" },
  { nameEn: "Ranipet", nameTa: "ராணிப்பேட்டை" },
  { nameEn: "Salem", nameTa: "சேலம்" },
  { nameEn: "Sivaganga", nameTa: "சிவகங்கை" },
  { nameEn: "Tenkasi", nameTa: "தென்காசி" },
  { nameEn: "Thanjavur", nameTa: "தஞ்சாவூர்" },
  { nameEn: "Theni", nameTa: "தேனி" },
  { nameEn: "Thoothukudi", nameTa: "தூத்துக்குடி" },
  { nameEn: "Tiruchirappalli", nameTa: "திருச்சிராப்பள்ளி" },
  { nameEn: "Tirunelveli", nameTa: "திருநெல்வேலி" },
  { nameEn: "Tirupattur", nameTa: "திருப்பத்தூர்" },
  { nameEn: "Tiruppur", nameTa: "திருப்பூர்" },
  { nameEn: "Tiruvallur", nameTa: "திருவள்ளூர்" },
  { nameEn: "Tiruvannamalai", nameTa: "திருவண்ணாமலை" },
  { nameEn: "Tiruvarur", nameTa: "திருவாரூர்" },
  { nameEn: "Vellore", nameTa: "வேலூர்" },
  { nameEn: "Viluppuram", nameTa: "விழுப்புரம்" },
  { nameEn: "Virudhunagar", nameTa: "விருதுநகர்" }
];

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

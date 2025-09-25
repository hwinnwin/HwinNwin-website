export const VEHICLE_PANELS = [
  "Front Bumper",
  "Rear Bumper",
  "Left Fender",
  "Right Fender",
  "Left Front Door",
  "Right Front Door",
  "Left Rear Door",
  "Right Rear Door",
  "Hood",
  "Roof",
  "Trunk/Tailgate",
  "Left Quarter Panel",
  "Right Quarter Panel",
  "Left Side Mirror",
  "Right Side Mirror",
  "Headlight (Left)",
  "Headlight (Right)",
  "Taillight (Left)",
  "Taillight (Right)",
  "Windshield",
  "Rear Window",
  "Left Side Window",
  "Right Side Window",
  "Interior Dashboard",
  "Interior Door Panel",
  "Interior Seats",
  "Other"
];

export const DAMAGE_SEVERITIES = [
  { value: "minor", label: "Minor" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" }
];

export const PAINT_TYPES = [
  { value: "solid", label: "Solid" },
  { value: "metallic", label: "Metallic" },
  { value: "pearlescent", label: "Pearlescent" }
];

export const REQUIRED_PHOTO_ANGLES = [
  "Front view",
  "Rear view", 
  "Left side",
  "Right side",
  "Close-up damage",
  "Interior (if damaged)"
];

export const VEHICLE_MAKES = [
  "Toyota",
  "Ford",
  "Holden",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Mazda",
  "Honda",
  "Nissan",
  "Hyundai",
  "Kia",
  "Subaru",
  "Mitsubishi",
  "Lexus",
  "Volvo",
  "Peugeot",
  "Renault",
  "Citroen",
  "Jeep",
  "Land Rover",
  "Jaguar",
  "Mini",
  "Porsche",
  "Other"
];

export const CURRENT_YEAR = new Date().getFullYear();
export const MIN_VEHICLE_YEAR = CURRENT_YEAR - 30;

export const FILE_VALIDATION = {
  MAX_SIZE: 8 * 1024 * 1024, // 8MB
  MIN_SIZE: 10 * 1024, // 10KB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MIN_DIMENSION: 640
};

export const CONTACT_INFO = {
  phone: "(03) 9123 4567",
  email: "quotes@panelrepair.com",
  address: "Melbourne, VIC",
  businessName: "Auto Panel Repair",
  tagline: "Professional Auto Damage Assessment"
};

// Site configuration
export const SITE_CONFIG = {
  baseUrl: import.meta.env.VITE_BASE_URL || 'https://hwinnwin.com',
  name: 'HwinNwin',
  tagline: 'Helping Businesses Scale with Structure, Mindset, and Excellence'
};

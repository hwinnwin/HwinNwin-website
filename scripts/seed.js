const path = require('path');
const { randomUUID } = require('crypto');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data', 'app.db');
const db = new Database(dbPath);

const now = new Date().toISOString();

// Generate random slug
function generateSlug() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Update default settings
const settings = {
  labourRate: 120,
  materialsPerPanel: 85,
  partsMarkup: 0.15,
  metallicMultiplier: 1.15,
  pearlescentMultiplier: 1.25,
  minJob: 220,
  logoUrl: "/static/lee-logo.png",
  primaryColor: "#1E40AF"
};

db.prepare(`
  UPDATE settings SET
    labour_rate = @labourRate,
    materials_per_panel = @materialsPerPanel,
    parts_markup = @partsMarkup,
    metallic_multiplier = @metallicMultiplier,
    pearlescent_multiplier = @pearlescentMultiplier,
    min_job = @minJob,
    logo_url = @logoUrl,
    primary_color = @primaryColor,
    updated_at = @updatedAt
  WHERE id = 1
`).run({ ...settings, updatedAt: now });

// Create demo quotes
const quoteId1 = randomUUID();
const quoteId2 = randomUUID();

// Example items
const items1 = [
  { panel: "Front Bumper", severity: "moderate", partsCost: 0, blend: true },
  { panel: "Left Fender", severity: "minor", partsCost: 0, blend: false }
];

const items2 = [
  { panel: "Rear Bumper", severity: "severe", partsCost: 150, blend: true },
  { panel: "Right Door", severity: "moderate", partsCost: 0, blend: true },
  { panel: "Right Fender", severity: "minor", partsCost: 0, blend: false }
];

// Calculation heuristics
const severityTable = {
  minor: { repairHrs: 1.5, paintHrs: 0.8, replace: false, blendDefault: false },
  moderate: { repairHrs: 3.0, paintHrs: 1.6, replace: false, blendDefault: true },
  severe: { repairHrs: 0.0, paintHrs: 2.2, replace: true, blendDefault: true }
};

function calcTotals(items, paintType, rates) {
  let repairHrs = 0, paintHrs = 0, materials = 0, parts = 0, blendPanels = 0;
  const paintMult =
    paintType === 'metallic' ? rates.metallicMultiplier :
    paintType === 'pearlescent' ? rates.pearlescentMultiplier : 1;

  for (const it of items) {
    const sev = severityTable[it.severity] || severityTable.minor;
    const rH = sev.replace ? 0 : sev.repairHrs;
    const pH = sev.paintHrs * paintMult;
    repairHrs += rH;
    paintHrs += pH;
    materials += rates.materialsPerPanel;
    parts += (it.partsCost || 0) * (1 + rates.partsMarkup);
    if (it.blend || sev.blendDefault) blendPanels += 1;
  }

  paintHrs += blendPanels * 0.6;
  materials += blendPanels * (rates.materialsPerPanel * 0.5);

  const labour = (repairHrs + paintHrs) * rates.labourRate;
  const subtotalExGST = Math.max(labour + materials + parts, rates.minJob);
  const gst = Math.round(subtotalExGST * 0.10 * 100) / 100;
  const totalIncGST = Math.round((subtotalExGST + gst) * 100) / 100;

  const confidence =
    items.length > 2 || items.some(i => i.severity === 'severe') ? 'low' : 'high';

  return {
    repairHrs: Math.round(repairHrs * 10) / 10,
    paintHrs: Math.round(paintHrs * 10) / 10,
    labour: Math.round(labour * 100) / 100,
    materials: Math.round(materials * 100) / 100,
    parts: Math.round(parts * 100) / 100,
    subtotalExGST: Math.round(subtotalExGST * 100) / 100,
    gst,
    totalIncGST,
    blendPanels,
    confidence
  };
}

const ratesSnapshot = { ...settings };

// Demo quote 1 (new)
const calc1 = calcTotals(items1, 'metallic', ratesSnapshot);
const customer1 = {
  name: "John Smith",
  phone: "0400 123 456",
  email: "john.smith@example.com"
};
const vehicle1 = {
  rego: "ABC123",
  make: "Toyota",
  model: "Camry",
  year: "2020",
  paint: "metallic"
};

db.prepare(`
  INSERT INTO quotes (
    id, status, created_at, updated_at,
    customer_name, customer_phone, customer_email,
    vehicle_rego, vehicle_make, vehicle_model, vehicle_year, vehicle_paint,
    items_json, rates_json, calc_json,
    owner_notes, customer_link_slug,
    photos_representative_confirmed, provisional_estimate_confirmed
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  quoteId1, 'new', now, now,
  customer1.name, customer1.phone, customer1.email,
  vehicle1.rego, vehicle1.make, vehicle1.model, vehicle1.year, vehicle1.paint,
  JSON.stringify(items1), JSON.stringify(ratesSnapshot), JSON.stringify(calc1),
  "Awaiting owner review - customer submitted clear photos", generateSlug(),
  1, 1
);

// Demo quote 2 (approved)
const calc2 = calcTotals(items2, 'pearlescent', ratesSnapshot);
const customer2 = {
  name: "Sarah Johnson",
  phone: "0400 987 654",
  email: "sarah.johnson@example.com"
};
const vehicle2 = {
  rego: "DEF456",
  make: "Ford",
  model: "Focus",
  year: "2019",
  paint: "pearlescent"
};

db.prepare(`
  INSERT INTO quotes (
    id, status, created_at, updated_at,
    customer_name, customer_phone, customer_email,
    vehicle_rego, vehicle_make, vehicle_model, vehicle_year, vehicle_paint,
    items_json, rates_json, calc_json,
    owner_notes, customer_link_slug,
    photos_representative_confirmed, provisional_estimate_confirmed
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  quoteId2, 'approved', now, now,
  customer2.name, customer2.phone, customer2.email,
  vehicle2.rego, vehicle2.make, vehicle2.model, vehicle2.year, vehicle2.paint,
  JSON.stringify(items2), JSON.stringify(ratesSnapshot), JSON.stringify(calc2),
  "Complex repair - rear panel replacement required", generateSlug(),
  1, 1
);

// Add status history
db.prepare(`
  INSERT INTO quote_status_history (quote_id, status, notes)
  VALUES (?, ?, ?)
`).run(quoteId1, 'new', 'Quote created');

db.prepare(`
  INSERT INTO quote_status_history (quote_id, status, notes)
  VALUES (?, ?, ?)
`).run(quoteId2, 'new', 'Quote created');

db.prepare(`
  INSERT INTO quote_status_history (quote_id, status, notes)
  VALUES (?, ?, ?)
`).run(quoteId2, 'approved', 'Quote approved by owner');

// Add sample testimonial
db.prepare(`
  INSERT INTO testimonials (quote_id, customer_name, rating, comment, consent_for_promo)
  VALUES (?, ?, ?, ?, ?)
`).run(
  quoteId2,
  "Sarah Johnson",
  5,
  "Excellent service! The quote was accurate and the repair quality was outstanding. Highly recommend Lee Murdok Panels.",
  1
);

console.log('Seed complete. Sample data inserted:');
console.table([
  { quoteId: quoteId1, customer: customer1.name, status: 'new', total: `$${calc1.totalIncGST}` },
  { quoteId: quoteId2, customer: customer2.name, status: 'approved', total: `$${calc2.totalIncGST}` }
]);

db.close();

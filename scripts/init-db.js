const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'app.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

const db = new Database(dbPath);

console.log('Initializing database...');

// Create tables
db.exec(`
  CREATE TABLE settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    labour_rate REAL NOT NULL DEFAULT 120,
    materials_per_panel REAL NOT NULL DEFAULT 85,
    parts_markup REAL NOT NULL DEFAULT 0.15,
    metallic_multiplier REAL NOT NULL DEFAULT 1.15,
    pearlescent_multiplier REAL NOT NULL DEFAULT 1.25,
    min_job REAL NOT NULL DEFAULT 220,
    logo_url TEXT DEFAULT '/static/lee-logo.png',
    primary_color TEXT DEFAULT '#1E40AF',
    owner_pin TEXT NOT NULL DEFAULT '123456',
    sendgrid_api_key TEXT,
    from_email TEXT DEFAULT 'quotes@leemurdokpanels.com.au',
    site_url TEXT DEFAULT 'https://lee888.com.au',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE quotes (
    id TEXT PRIMARY KEY,
    status TEXT CHECK(status IN ('new', 'approved', 'sent')) NOT NULL DEFAULT 'new',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    vehicle_rego TEXT NOT NULL,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year TEXT NOT NULL,
    vehicle_paint TEXT CHECK(vehicle_paint IN ('solid', 'metallic', 'pearlescent')) NOT NULL,
    items_json TEXT NOT NULL,
    rates_json TEXT NOT NULL,
    calc_json TEXT NOT NULL,
    photos_json TEXT,
    owner_notes TEXT,
    customer_link_slug TEXT NOT NULL UNIQUE,
    photos_representative_confirmed INTEGER NOT NULL DEFAULT 0,
    provisional_estimate_confirmed INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE quote_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    status TEXT CHECK(status IN ('new', 'approved', 'sent')) NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
  );

  CREATE TABLE testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id TEXT NOT NULL REFERENCES quotes(id),
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    consent_for_promo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Indexes
  CREATE INDEX idx_quotes_status ON quotes(status);
  CREATE INDEX idx_quotes_slug ON quotes(customer_link_slug);
  CREATE INDEX idx_quote_history_quote_id ON quote_status_history(quote_id);
`);

// Insert default settings
db.prepare(`
  INSERT INTO settings (id) VALUES (1)
`).run();

console.log('Database initialized successfully');
console.log('Default settings created with PIN: 123456');
console.log('Database location:', dbPath);

db.close();

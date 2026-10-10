-- ============================================================================
-- HARVEST BRIDGE — Enterprise Relational Database Schema (PostgreSQL / RDBMS)
-- Normalized tables, Primary & Foreign Keys, Unique Constraints, Check Constraints,
-- and High-Performance B-Tree Indexes for National Scale Operations
-- ============================================================================

-- 1. USERS & ACTORS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'buyer', 'organization', 'admin')),
  language VARCHAR(10) DEFAULT 'en',
  location VARCHAR(255),
  district VARCHAR(100),
  category VARCHAR(50),
  farm_size NUMERIC(10,2) DEFAULT 0,
  capacity NUMERIC(12,2) DEFAULT 0,
  preferred_price_min NUMERIC(10,2) DEFAULT 0,
  preferred_price_max NUMERIC(10,2) DEFAULT 0,
  pickup_available BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  verification_notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_district ON users(district);

-- 2. CROP LISTINGS TABLE
CREATE TABLE IF NOT EXISTS crop_listings (
  id VARCHAR(64) PRIMARY KEY,
  farmer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_name VARCHAR(255) NOT NULL,
  farmer_phone VARCHAR(20) NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  category VARCHAR(100),
  location VARCHAR(255) NOT NULL,
  district VARCHAR(100),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  total_quantity NUMERIC(12,2) NOT NULL CHECK (total_quantity > 0),
  available_quantity NUMERIC(12,2) NOT NULL CHECK (available_quantity >= 0),
  reserved_quantity NUMERIC(12,2) DEFAULT 0 CHECK (reserved_quantity >= 0),
  sold_quantity NUMERIC(12,2) DEFAULT 0 CHECK (sold_quantity >= 0),
  wasted_quantity NUMERIC(12,2) DEFAULT 0 CHECK (wasted_quantity >= 0),
  unit VARCHAR(20) DEFAULT 'kg',
  expected_harvest_date DATE NOT NULL,
  quality_grade VARCHAR(50),
  storage_type VARCHAR(100),
  shelf_life_days INT DEFAULT 5,
  min_acceptable_price NUMERIC(10,2) NOT NULL CHECK (min_acceptable_price > 0),
  estimated_market_price NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'reserved', 'completed', 'cancelled')),
  surplus_risk_score INT DEFAULT 0 CHECK (surplus_risk_score BETWEEN 0 AND 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crop_listings_farmer ON crop_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_listings_status ON crop_listings(status);
CREATE INDEX IF NOT EXISTS idx_crop_listings_crop ON crop_listings(crop_name);
CREATE INDEX IF NOT EXISTS idx_crop_listings_harvest ON crop_listings(expected_harvest_date);

-- 3. OFFERS TABLE
CREATE TABLE IF NOT EXISTS offers (
  id VARCHAR(64) PRIMARY KEY,
  listing_id VARCHAR(64) NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
  crop_name VARCHAR(100) NOT NULL,
  farmer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  farmer_name VARCHAR(255) NOT NULL,
  buyer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  buyer_name VARCHAR(255) NOT NULL,
  buyer_role VARCHAR(50) NOT NULL,
  buyer_category VARCHAR(50),
  offered_quantity NUMERIC(12,2) NOT NULL CHECK (offered_quantity > 0),
  offered_price_per_kg NUMERIC(10,2) NOT NULL CHECK (offered_price_per_kg > 0),
  transport_option VARCHAR(50) NOT NULL CHECK (transport_option IN ('buyer_pickup', 'farmer_delivery')),
  pickup_date DATE,
  distance_km NUMERIC(10,2) DEFAULT 0,
  transport_cost NUMERIC(10,2) DEFAULT 0,
  handling_cost NUMERIC(10,2) DEFAULT 0,
  platform_fee NUMERIC(10,2) DEFAULT 0,
  estimated_net_earnings NUMERIC(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offers_listing ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_farmer ON offers(farmer_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- 4. ORDERS & FULFILLMENT TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  offer_id VARCHAR(64) REFERENCES offers(id),
  listing_id VARCHAR(64) NOT NULL REFERENCES crop_listings(id),
  farmer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  farmer_name VARCHAR(255) NOT NULL,
  farmer_phone VARCHAR(20),
  buyer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(20),
  crop_name VARCHAR(100) NOT NULL,
  quantity_kg NUMERIC(12,2) NOT NULL CHECK (quantity_kg > 0),
  agreed_price_per_kg NUMERIC(10,2) NOT NULL CHECK (agreed_price_per_kg > 0),
  gross_order_value NUMERIC(12,2) NOT NULL,
  net_farmer_earnings NUMERIC(12,2) NOT NULL,
  transport_option VARCHAR(50) NOT NULL,
  scheduled_pickup_date DATE,
  actual_pickup_date DATE,
  actual_delivery_date DATE,
  driver_name VARCHAR(255),
  vehicle_number VARCHAR(50),
  inspected_weight_kg NUMERIC(12,2),
  delivered_weight_kg NUMERIC(12,2),
  confirmed_loss_kg NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'scheduled_pickup' CHECK (status IN ('scheduled_pickup', 'in_transit', 'completed', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'escrow_pending' CHECK (payment_status IN ('escrow_pending', 'escrow_locked', 'disbursed_to_farmer', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_farmer ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_listing ON orders(listing_id);

-- 5. IMPACT RECORDS TABLE (Social & Ecological Metrics)
CREATE TABLE IF NOT EXISTS impact_records (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) REFERENCES orders(id),
  crop_name VARCHAR(100) NOT NULL,
  farmer_id VARCHAR(64) REFERENCES users(id),
  farmer_name VARCHAR(255) NOT NULL,
  buyer_id VARCHAR(64) REFERENCES users(id),
  buyer_name VARCHAR(255) NOT NULL,
  quantity_redirected_kg NUMERIC(12,2) NOT NULL CHECK (quantity_redirected_kg >= 0),
  value_protected_inr NUMERIC(12,2) NOT NULL CHECK (value_protected_inr >= 0),
  waste_avoided_kg NUMERIC(12,2) NOT NULL,
  co2e_avoided_kg NUMERIC(12,2) NOT NULL,
  water_saved_liters NUMERIC(14,2) NOT NULL,
  recipient_category VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_impact_order ON impact_records(order_id);
CREATE INDEX IF NOT EXISTS idx_impact_recipient ON impact_records(recipient_category);

-- 6. MARKET OBSERVATIONS TABLE (APMC Benchmarks)
CREATE TABLE IF NOT EXISTS market_observations (
  id VARCHAR(64) PRIMARY KEY,
  market_name VARCHAR(255) NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) DEFAULT 'Andhra Pradesh',
  crop VARCHAR(100) NOT NULL,
  variety VARCHAR(100),
  min_price NUMERIC(10,2) NOT NULL,
  modal_price NUMERIC(10,2) NOT NULL,
  max_price NUMERIC(10,2) NOT NULL,
  daily_arrivals_quintals NUMERIC(12,2) NOT NULL,
  trend VARCHAR(20) DEFAULT 'stable' CHECK (trend IN ('rising', 'stable', 'falling')),
  price_change_percent NUMERIC(5,2) DEFAULT 0,
  source VARCHAR(255) NOT NULL,
  is_live_verified BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_crop_district ON market_observations(crop, district);

-- 7. AUDIT LOGS TABLE (Security & Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  actor_id VARCHAR(64),
  actor_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  target_id VARCHAR(64),
  target_type VARCHAR(100),
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);

-- ============================================
-- NEXUS POS DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  manager TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  buying_price NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Movements
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stock_in', 'stock_out', 'adjustment')),
  quantity INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_number TEXT NOT NULL UNIQUE,
  cashier TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital', 'credit')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'refunded')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  item_total NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transfers
CREATE TABLE IF NOT EXISTS payment_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  sale_payment_id UUID,
  from_payment_type TEXT NOT NULL CHECK (from_payment_type IN ('cash', 'card', 'digital', 'credit')),
  to_payment_type TEXT NOT NULL CHECK (to_payment_type IN ('cash', 'card', 'digital', 'credit')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  reason TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (single row)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL DEFAULT 'Nexus POS Store',
  logo TEXT,
  currency TEXT NOT NULL DEFAULT 'PHP',
  timezone TEXT NOT NULL DEFAULT 'Asia/Manila',
  tax_rate NUMERIC NOT NULL DEFAULT 12,
  receipt_header TEXT NOT NULL DEFAULT 'Thank you for shopping!',
  receipt_footer TEXT NOT NULL DEFAULT 'Please come again.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transfers_sale ON payment_transfers(sale_id);
CREATE INDEX IF NOT EXISTS idx_payment_transfers_created_at ON payment_transfers(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated read profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read branches" ON branches FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read categories" ON categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read products" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read inventory_movements" ON inventory_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read sales" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read sale_items" ON sale_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read payment_transfers" ON payment_transfers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read settings" ON settings FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role full access (for API)
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access branches" ON branches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access customers" ON customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access categories" ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access products" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access inventory_movements" ON inventory_movements FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access sales" ON sales FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access sale_items" ON sale_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access payment_transfers" ON payment_transfers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access settings" ON settings FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- SEED DATA
-- ============================================

-- Default categories
INSERT INTO categories (id, name, description) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Electronics', 'Electronic devices and gadgets'),
  ('a2222222-2222-2222-2222-222222222222', 'Groceries', 'Food and grocery items'),
  ('a3333333-3333-3333-3333-333333333333', 'Beverages', 'Drinks and beverages'),
  ('a4444444-4444-4444-4444-444444444444', 'Snacks', 'Snack foods'),
  ('a5555555-5555-5555-5555-555555555555', 'Personal Care', 'Personal care products'),
  ('a6666666-6666-6666-6666-666666666666', 'Household', 'Household items'),
  ('a7777777-7777-7777-7777-777777777777', 'Stationery', 'Office and school supplies'),
  ('a8888888-8888-8888-8888-888888888888', 'Frozen Foods', 'Frozen food products')
ON CONFLICT (id) DO NOTHING;

-- Default branches
INSERT INTO branches (id, name, address, manager, contact_number, status) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Main Branch - Makati', '123 Ayala Ave, Makati City', 'John Manager', '+63 917 123 4567', 'active'),
  ('b2222222-2222-2222-2222-222222222222', 'Branch 2 - BGC', '456 Bonifacio Global City, Taguig', 'Sarah Admin', '+63 917 234 5678', 'active'),
  ('b3333333-3333-3333-3333-333333333333', 'Branch 3 - Quezon City', '789 Tomas Morato Ave, QC', 'Mike Supervisor', '+63 917 345 6789', 'active'),
  ('b4444444-4444-4444-4444-444444444444', 'Branch 4 - Alabang', '321 Alabang-Zapote Rd, Muntinlupa', 'Lisa Manager', '+63 917 456 7890', 'inactive')
ON CONFLICT (id) DO NOTHING;

-- Default settings
INSERT INTO settings (id, business_name, currency, timezone, tax_rate, receipt_header, receipt_footer) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Nexus POS Store', 'PHP', 'Asia/Manila', 12, 'Thank you for shopping!', 'Please come again.')
ON CONFLICT (id) DO NOTHING;

-- Default products
INSERT INTO products (id, name, sku, barcode, description, category_id, buying_price, selling_price, current_stock, minimum_stock, unit, status) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'iPhone 15 Pro', 'IPH-15P-001', '1234567890', 'Apple iPhone 15 Pro 256GB', 'a1111111-1111-1111-1111-111111111111', 55000, 62990, 25, 5, 'pcs', 'in_stock'),
  ('d2222222-2222-2222-2222-222222222222', 'Samsung Galaxy S24', 'SAM-S24-001', '1234567891', 'Samsung Galaxy S24 Ultra', 'a1111111-1111-1111-1111-111111111111', 48000, 54990, 18, 5, 'pcs', 'in_stock'),
  ('d3333333-3333-3333-3333-333333333333', 'Rice (Jasmine)', 'RCE-JMS-001', '1234567892', 'Premium Jasmine Rice 5kg', 'a2222222-2222-2222-2222-222222222222', 220, 285, 150, 20, 'kg', 'in_stock'),
  ('d4444444-4444-4444-4444-444444444444', 'Coca-Cola 1.5L', 'CC-15L-001', '1234567893', 'Coca-Cola 1.5L Bottle', 'a3333333-3333-3333-3333-333333333333', 38, 55, 8, 20, 'pcs', 'low_stock'),
  ('d5555555-5555-5555-5555-555555555555', 'Lays Classic', 'LYS-CLS-001', '1234567894', 'Lays Classic Salted Chips', 'a4444444-4444-4444-4444-444444444444', 32, 45, 0, 10, 'pcs', 'out_of_stock'),
  ('d6666666-6666-6666-6666-666666666666', 'Pantene Shampoo', 'PNT-SHM-001', '1234567895', 'Pantene Total Damage Care 400ml', 'a5555555-5555-5555-5555-555555555555', 145, 189, 42, 10, 'pcs', 'in_stock'),
  ('d7777777-7777-7777-7777-777777777777', 'Pledge Multi-Surface', 'PLD-MS-001', '1234567896', 'Pledge Multi-Surface Cleaner 500ml', 'a6666666-6666-6666-6666-666666666666', 120, 165, 3, 8, 'pcs', 'low_stock'),
  ('d8888888-8888-8888-8888-888888888888', 'Pilot Pen Set', 'PLT-PEN-001', '1234567897', 'Pilot G-2 Gel Pen Set of 3', 'a7777777-7777-7777-7777-777777777777', 85, 120, 65, 15, 'pack', 'in_stock'),
  ('d9999999-9999-9999-9999-999999999999', 'Hotdog Buns', 'HDG-BNS-001', '1234567898', 'Gardenia Hotdog Buns 6pcs', 'a8888888-8888-8888-8888-888888888888', 35, 52, 12, 15, 'pack', 'low_stock'),
  ('da111111-1111-1111-1111-111111111111', 'MacBook Air M3', 'MBA-M3-001', '1234567899', 'Apple MacBook Air M3 13-inch 256GB', 'a1111111-1111-1111-1111-111111111111', 62000, 69990, 10, 3, 'pcs', 'in_stock'),
  ('da222222-2222-2222-2222-222222222222', 'Oishi Prawn Crackers', 'OIS-PRC-001', '1234567900', 'Oishi Prawn Crackers 100g', 'a4444444-4444-4444-4444-444444444444', 18, 28, 200, 30, 'pcs', 'in_stock'),
  ('da333333-3333-3333-3333-333333333333', 'Bear Brand Milk', 'BBR-MLK-001', '1234567901', 'Bear Brand Powdered Milk 900g', 'a2222222-2222-2222-2222-222222222222', 185, 235, 35, 10, 'pcs', 'in_stock'),
  ('da444444-4444-4444-4444-444444444444', 'Joy Dishwashing Liquid', 'JOY-DWL-001', '1234567902', 'Joy antibacterial 500ml', 'a6666666-6666-6666-6666-666666666666', 42, 58, 0, 12, 'pcs', 'out_of_stock'),
  ('da555555-5555-5555-5555-555555555555', 'Nestle Coffee Mate', 'NCF-CM-001', '1234567903', 'Nestle Coffee Mate 200g', 'a3333333-3333-3333-3333-333333333333', 88, 115, 50, 10, 'pcs', 'in_stock'),
  ('da666666-6666-6666-6666-666666666666', 'Tissue Paper 3-ply', 'TSP-3PL-001', '1234567904', 'Solo 3-ply Tissue Box 150 sheets', 'a6666666-6666-6666-6666-666666666666', 65, 89, 75, 20, 'box', 'in_stock')
ON CONFLICT (id) DO NOTHING;

-- Default customers
INSERT INTO customers (id, first_name, last_name, phone, address, remarks) VALUES
  ('ca111111-1111-1111-1111-111111111111', 'Maria', 'Santos', '+63 917 111 2222', '123 Ayala Ave, Makati City', 'Regular customer'),
  ('ca222222-2222-2222-2222-222222222222', 'Juan', 'Dela Cruz', '+63 918 333 4444', '456 Bonifacio Global City, Taguig', NULL),
  ('ca333333-3333-3333-3333-333333333333', 'Ana', 'Reyes', '+63 919 555 6666', '789 Tomas Morato Ave, QC', 'Prefers email receipt'),
  ('ca444444-4444-4444-4444-444444444444', 'Pedro', 'Garcia', '+63 920 777 8888', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Default sales
INSERT INTO sales (id, transaction_number, cashier, customer_id, subtotal, discount, total, payment_method, status, date) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'TXN-20260710-001', 'Jane Cashier', 'ca111111-1111-1111-1111-111111111111', 63100, 0, 63100, 'card', 'completed', '2026-07-10T10:30:00'),
  ('e2222222-2222-2222-2222-222222222222', 'TXN-20260710-002', 'Jane Cashier', NULL, 1509, 50, 1459, 'cash', 'completed', '2026-07-10T11:15:00'),
  ('e3333333-3333-3333-3333-333333333333', 'TXN-20260710-003', 'Mark Cashier', 'ca222222-2222-2222-2222-222222222222', 54990, 0, 54990, 'digital', 'completed', '2026-07-10T13:00:00'),
  ('e4444444-4444-4444-4444-444444444444', 'TXN-20260709-001', 'Jane Cashier', NULL, 645, 0, 645, 'cash', 'completed', '2026-07-09T14:30:00'),
  ('e5555555-5555-5555-5555-555555555555', 'TXN-20260709-002', 'Mark Cashier', 'ca333333-3333-3333-3333-333333333333', 69990, 2000, 67990, 'card', 'completed', '2026-07-09T15:45:00'),
  ('e6666666-6666-6666-6666-666666666666', 'TXN-20260708-001', 'Jane Cashier', NULL, 1070, 70, 1000, 'cash', 'completed', '2026-07-08T09:20:00'),
  ('e7777777-7777-7777-7777-777777777777', 'TXN-20260708-002', 'Mark Cashier', 'ca444444-4444-4444-4444-444444444444', 115, 0, 115, 'digital', 'refunded', '2026-07-08T10:00:00'),
  ('e8888888-8888-8888-8888-888888888888', 'TXN-20260707-001', 'Jane Cashier', NULL, 63168, 0, 63168, 'card', 'completed', '2026-07-07T16:00:00')
ON CONFLICT (id) DO NOTHING;

-- Default sale items
INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, price, item_total) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'iPhone 15 Pro', 1, 62990, 62990),
  ('f2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'Coca-Cola 1.5L', 2, 55, 110),
  ('f3333333-3333-3333-3333-333333333333', 'e2222222-2222-2222-2222-222222222222', 'd3333333-3333-3333-3333-333333333333', 'Rice (Jasmine)', 5, 285, 1425),
  ('f4444444-4444-4444-4444-444444444444', 'e2222222-2222-2222-2222-222222222222', 'da222222-2222-2222-2222-222222222222', 'Oishi Prawn Crackers', 3, 28, 84),
  ('f5555555-5555-5555-5555-555555555555', 'e3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'Samsung Galaxy S24', 1, 54990, 54990),
  ('f6666666-6666-6666-6666-666666666666', 'e4444444-4444-4444-4444-444444444444', 'd6666666-6666-6666-6666-666666666666', 'Pantene Shampoo', 2, 189, 378),
  ('f7777777-7777-7777-7777-777777777777', 'e4444444-4444-4444-4444-444444444444', 'da666666-6666-6666-6666-666666666666', 'Tissue Paper 3-ply', 3, 89, 267),
  ('f8888888-8888-8888-8888-888888888888', 'e5555555-5555-5555-5555-555555555555', 'da111111-1111-1111-1111-111111111111', 'MacBook Air M3', 1, 69990, 69990),
  ('f9999999-9999-9999-9999-999999999999', 'e6666666-6666-6666-6666-666666666666', 'd8888888-8888-8888-8888-888888888888', 'Pilot Pen Set', 5, 120, 600),
  ('fa111111-1111-1111-1111-111111111111', 'e6666666-6666-6666-6666-666666666666', 'da333333-3333-3333-3333-333333333333', 'Bear Brand Milk', 2, 235, 470),
  ('fa222222-2222-2222-2222-222222222222', 'e7777777-7777-7777-7777-777777777777', 'da555555-5555-5555-5555-555555555555', 'Nestle Coffee Mate', 1, 115, 115),
  ('fa333333-3333-3333-3333-333333333333', 'e8888888-8888-8888-8888-888888888888', 'd1111111-1111-1111-1111-111111111111', 'iPhone 15 Pro', 1, 62990, 62990),
  ('fa444444-4444-4444-4444-444444444444', 'e8888888-8888-8888-8888-888888888888', 'da666666-6666-6666-6666-666666666666', 'Tissue Paper 3-ply', 2, 89, 178)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

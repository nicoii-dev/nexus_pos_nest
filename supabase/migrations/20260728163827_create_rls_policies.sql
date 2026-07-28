ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read branches" ON branches FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read categories" ON categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read products" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read inventory_movements" ON inventory_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read sales" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read sale_items" ON sale_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read settings" ON settings FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access branches" ON branches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access categories" ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access products" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access inventory_movements" ON inventory_movements FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access sales" ON sales FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access sale_items" ON sale_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access settings" ON settings FOR ALL USING (auth.role() = 'service_role');

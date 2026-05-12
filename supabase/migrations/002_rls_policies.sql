ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_admin_read" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "products_read" ON products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "products_admin_write" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "quotations_access" ON quotations FOR ALL
  USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "items_access" ON quotation_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quotations q WHERE q.id = quotation_id AND (
        q.created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

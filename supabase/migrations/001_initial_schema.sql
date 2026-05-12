CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  spec text,
  unit text NOT NULL DEFAULT '台',
  cash_price numeric(10,2) NOT NULL DEFAULT 0,
  card_price numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT '其他',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS text AS $$
DECLARE
  year_str text;
  next_num int;
BEGIN
  year_str := to_char(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO next_num
  FROM quotations
  WHERE number LIKE 'MN-' || year_str || '-%';
  RETURN 'MN-' || year_str || '-' || LPAD(next_num::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE quotations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  number text UNIQUE NOT NULL DEFAULT generate_quotation_number(),
  client_name text NOT NULL,
  client_tax_id text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  valid_days int NOT NULL DEFAULT 30,
  show_cash boolean NOT NULL DEFAULT true,
  show_card boolean NOT NULL DEFAULT true,
  tax_rate numeric(4,1) NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL CHECK (status IN ('draft','sent','deal','expired')) DEFAULT 'draft',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE quotation_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
  seq int NOT NULL DEFAULT 0,
  product_name text NOT NULL,
  spec text,
  qty numeric(10,2) NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT '台',
  cash_price numeric(10,2) NOT NULL DEFAULT 0,
  card_price numeric(10,2) NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 'staff');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

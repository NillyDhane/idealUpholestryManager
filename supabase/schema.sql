-- Create tables for upholstery application

-- Table for storing upholstery orders
CREATE TABLE upholstery_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  van_number TEXT NOT NULL,
  model TEXT NOT NULL,
  order_date DATE NOT NULL,
  brand_of_sample TEXT NOT NULL,
  color_of_sample TEXT NOT NULL,
  bed_head TEXT NOT NULL,
  arms TEXT NOT NULL,
  base TEXT,
  mag_pockets TEXT NOT NULL,
  head_bumper TEXT NOT NULL DEFAULT 'false',
  other TEXT,
  lounge_type TEXT NOT NULL,
  design TEXT NOT NULL,
  curtain TEXT NOT NULL DEFAULT 'Yes',
  stitching TEXT NOT NULL,
  bunk_mattresses TEXT NOT NULL DEFAULT 'None'
);

-- Table for storing presets
CREATE TABLE upholstery_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_name TEXT NOT NULL,
  van_number TEXT NOT NULL,
  model TEXT NOT NULL,
  order_date DATE NOT NULL,
  brand_of_sample TEXT NOT NULL,
  color_of_sample TEXT NOT NULL,
  bed_head TEXT NOT NULL,
  arms TEXT NOT NULL,
  base TEXT,
  mag_pockets TEXT NOT NULL,
  head_bumper TEXT NOT NULL DEFAULT 'false',
  other TEXT,
  lounge_type TEXT NOT NULL,
  design TEXT NOT NULL,
  curtain TEXT NOT NULL DEFAULT 'Yes',
  stitching TEXT NOT NULL,
  bunk_mattresses TEXT NOT NULL DEFAULT 'None',
  UNIQUE(user_id, preset_name) -- Make preset names unique per user
);

-- Create indexes for better performance
CREATE INDEX idx_presets_created_at ON upholstery_presets(created_at DESC);
CREATE INDEX idx_presets_preset_name ON upholstery_presets(preset_name);
CREATE INDEX idx_presets_van_number ON upholstery_presets(van_number);
CREATE INDEX idx_presets_user_id ON upholstery_presets(user_id);
CREATE INDEX idx_orders_user_id ON upholstery_orders(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_presets_updated_at
    BEFORE UPDATE ON upholstery_presets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE upholstery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE upholstery_presets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous select on upholstery_orders" ON upholstery_orders;
DROP POLICY IF EXISTS "Allow anonymous insert on upholstery_orders" ON upholstery_orders;
DROP POLICY IF EXISTS "Allow anonymous select on upholstery_presets" ON upholstery_presets;
DROP POLICY IF EXISTS "Allow anonymous insert on upholstery_presets" ON upholstery_presets;
DROP POLICY IF EXISTS "Allow anonymous delete on upholstery_presets" ON upholstery_presets;
DROP POLICY IF EXISTS "Allow anonymous update on upholstery_presets" ON upholstery_presets;

-- Create policies for upholstery_orders
CREATE POLICY "Enable read access for own orders"
  ON upholstery_orders FOR SELECT
  USING (
    CASE 
      WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
      ELSE user_id IS NULL
    END
  );

CREATE POLICY "Enable insert access for orders"
  ON upholstery_orders FOR INSERT
  WITH CHECK (
    CASE
      WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
      ELSE user_id IS NULL
    END
  );

-- Create policies for upholstery_presets
CREATE POLICY "Enable read access for own presets"
  ON upholstery_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for own presets"
  ON upholstery_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for own presets"
  ON upholstery_presets FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update access for own presets"
  ON upholstery_presets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id); 
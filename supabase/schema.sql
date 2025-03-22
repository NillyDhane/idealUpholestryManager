-- Create tables for upholstery application

-- Table for storing upholstery orders
CREATE TABLE upholstery_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  preset_name TEXT NOT NULL UNIQUE,
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

-- Create indexes for better performance
CREATE INDEX idx_presets_created_at ON upholstery_presets(created_at DESC);
CREATE INDEX idx_presets_preset_name ON upholstery_presets(preset_name);
CREATE INDEX idx_presets_van_number ON upholstery_presets(van_number);

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

-- Create policies to allow access without authentication
-- For production, you would want to add proper authentication and authorization

-- Enable RLS
ALTER TABLE upholstery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE upholstery_presets ENABLE ROW LEVEL SECURITY;

-- Create policies for upholstery_orders
CREATE POLICY "Allow anonymous select on upholstery_orders"
  ON upholstery_orders FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on upholstery_orders"
  ON upholstery_orders FOR INSERT WITH CHECK (true);

-- Create policies for upholstery_presets
CREATE POLICY "Allow anonymous select on upholstery_presets"
  ON upholstery_presets FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on upholstery_presets"
  ON upholstery_presets FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on upholstery_presets"
  ON upholstery_presets FOR DELETE USING (true);

CREATE POLICY "Allow anonymous update on upholstery_presets"
  ON upholstery_presets FOR UPDATE USING (true) WITH CHECK (true); 
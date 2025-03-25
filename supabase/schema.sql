-- Drop existing tables and types
DROP TABLE IF EXISTS upholstery_presets;
DROP TABLE IF EXISTS upholstery_orders;
DROP TABLE IF EXISTS important_tasks;
DROP TYPE IF EXISTS brand_type;
DROP TYPE IF EXISTS shann_color_type;
DROP TYPE IF EXISTS warranty_handler;
DROP TYPE IF EXISTS assigned_person;

-- Create enum types
CREATE TYPE brand_type AS ENUM ('Shann');

CREATE TYPE shann_color_type AS ENUM (
  'Bison', 'Cashmere', 'Cement', 'Cherry', 'Cigar', 'Clay', 'Flint',
  'Glacier', 'Mahogany', 'Maize', 'Metal', 'Oasis', 'Vanilla', 'Volcano', 'Zodiac'
);

-- Table for storing upholstery orders
CREATE TABLE upholstery_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  van_number TEXT NOT NULL,
  model TEXT NOT NULL,
  model_type TEXT NOT NULL,
  order_date DATE NOT NULL,
  brand_of_sample brand_type NOT NULL,
  color_of_sample shann_color_type NOT NULL,
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
  layout_id TEXT,
  layout_width TEXT,
  layout_length TEXT,
  layout_name TEXT,
  layout_image_url TEXT
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
  model_type TEXT NOT NULL,
  order_date DATE NOT NULL,
  brand_of_sample brand_type NOT NULL,
  color_of_sample shann_color_type NOT NULL,
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
  layout_id TEXT,
  layout_width TEXT,
  layout_length TEXT,
  layout_name TEXT,
  layout_image_url TEXT,
  UNIQUE(user_id, preset_name)
);

-- Create indexes for better performance
CREATE INDEX idx_presets_created_at ON upholstery_presets(created_at DESC);
CREATE INDEX idx_presets_preset_name ON upholstery_presets(preset_name);
CREATE INDEX idx_presets_van_number ON upholstery_presets(van_number);
CREATE INDEX idx_presets_user_id ON upholstery_presets(user_id);
CREATE INDEX idx_orders_user_id ON upholstery_orders(user_id);
CREATE INDEX idx_orders_layout_id ON upholstery_orders(layout_id);
CREATE INDEX idx_presets_layout_id ON upholstery_presets(layout_id);

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

-- Create enum types for warranty_handled_by and assigned_to
CREATE TYPE warranty_handler AS ENUM ('Destiny', 'Danny', 'Nish');
CREATE TYPE assigned_person AS ENUM ('Plumbers', 'Ridma', 'Ravi');

-- Create the important_tasks table
CREATE TABLE important_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    van_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    issue TEXT NOT NULL,
    warranty_handled_by warranty_handler NOT NULL,
    assigned_to assigned_person NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT false
);

-- Create an index on due_date for faster filtering
CREATE INDEX idx_important_tasks_due_date ON important_tasks(due_date);

-- Create an index on is_completed for better filtering performance
CREATE INDEX idx_important_tasks_is_completed ON important_tasks(is_completed);

-- Create a trigger to automatically update the updated_at column for important_tasks
CREATE TRIGGER update_important_tasks_updated_at
    BEFORE UPDATE ON important_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for important_tasks
ALTER TABLE important_tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all tasks
CREATE POLICY "Allow authenticated users to read tasks"
    ON important_tasks FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert tasks
CREATE POLICY "Allow authenticated users to insert tasks"
    ON important_tasks FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update their own tasks
CREATE POLICY "Allow authenticated users to update tasks"
    ON important_tasks FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete tasks
CREATE POLICY "Allow authenticated users to delete tasks"
    ON important_tasks FOR DELETE
    TO authenticated
    USING (true); 
-- Create enum types for warranty_handled_by and assigned_to
CREATE TYPE warranty_handler AS ENUM ('Destiny', 'Danny', 'Nish');
CREATE TYPE assigned_person AS ENUM ('Plumbers', 'Ridma', 'Ravi');

-- Create the important_tasks table
CREATE TABLE important_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    van_number TEXT NOT NULL,
    customer_number TEXT NOT NULL,
    issue TEXT NOT NULL,
    warranty_handled_by warranty_handler NOT NULL,
    assigned_to assigned_person NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on due_date for faster filtering
CREATE INDEX idx_important_tasks_due_date ON important_tasks(due_date);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_important_tasks_updated_at
    BEFORE UPDATE ON important_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
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
-- Add is_completed column to important_tasks table with default value of false
ALTER TABLE important_tasks ADD COLUMN is_completed BOOLEAN DEFAULT false;

-- Create an index on is_completed for better filtering performance
CREATE INDEX idx_important_tasks_is_completed ON important_tasks(is_completed); 
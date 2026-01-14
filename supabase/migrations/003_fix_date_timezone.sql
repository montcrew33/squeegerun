-- Fix timezone issues with scheduled_date column
-- The issue is that PostgreSQL's 'date' type can behave differently with timezones

-- First, let's check if there are any existing jobs that need to be preserved
-- We'll convert the date column to be more explicit about timezone handling

-- Create a function to ensure dates are handled correctly
CREATE OR REPLACE FUNCTION normalize_date(input_date text) 
RETURNS date AS $$
BEGIN
  -- If input is already a date, return it
  IF input_date ~ '^\d{4}-\d{2}-\d{2}$' THEN
    RETURN input_date::date;
  END IF;
  
  -- For other formats, parse and return the date part only
  RETURN (input_date::timestamptz)::date;
END;
$$ LANGUAGE plpgsql;

-- Add a comment to document the timezone handling
COMMENT ON COLUMN jobs.scheduled_date IS 'Date in local timezone, stored as DATE type to avoid timezone conversion issues';

-- Note: We're keeping the date type but documenting the expected behavior
-- The actual fix will be in the application code to ensure proper date formatting
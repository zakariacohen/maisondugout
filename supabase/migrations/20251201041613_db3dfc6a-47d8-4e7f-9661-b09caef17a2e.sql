-- Drop the old constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_category;

-- Add new constraint with 'both' option
ALTER TABLE products ADD CONSTRAINT valid_category CHECK (category IN ('normal', 'ramadan', 'both'));
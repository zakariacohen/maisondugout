-- Update constraint to include 'traiteur' category
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_category;
ALTER TABLE products ADD CONSTRAINT valid_category CHECK (category IN ('normal', 'ramadan', 'both', 'traiteur'));
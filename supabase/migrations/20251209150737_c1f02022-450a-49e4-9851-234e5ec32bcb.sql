-- Remove the old check constraint that only allows single categories
ALTER TABLE products DROP CONSTRAINT valid_category;

-- Add a comment explaining the new category format
COMMENT ON COLUMN products.category IS 'Comma-separated list of categories: normal, ramadan, traiteur, service, autre_service';
-- Add category column to products table
ALTER TABLE products ADD COLUMN category text DEFAULT 'normal' NOT NULL;

-- Add check constraint for valid categories
ALTER TABLE products ADD CONSTRAINT valid_category CHECK (category IN ('normal', 'ramadan'));

-- Create index for better query performance
CREATE INDEX idx_products_category ON products(category);
-- Add stock management columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_alert_threshold INTEGER NOT NULL DEFAULT 10;

-- Add comment to explain the columns
COMMENT ON COLUMN public.products.stock IS 'Current stock quantity available';
COMMENT ON COLUMN public.products.stock_alert_threshold IS 'Minimum stock level before triggering low stock alert';
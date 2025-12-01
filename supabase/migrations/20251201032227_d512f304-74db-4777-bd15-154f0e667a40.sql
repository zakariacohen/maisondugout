-- Add icon column to products table to store Lucide icon names
ALTER TABLE public.products 
ADD COLUMN icon text DEFAULT 'Package';
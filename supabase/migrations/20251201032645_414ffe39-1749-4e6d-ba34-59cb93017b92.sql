-- Add delivery_address column to orders table
ALTER TABLE public.orders 
ADD COLUMN delivery_address text;
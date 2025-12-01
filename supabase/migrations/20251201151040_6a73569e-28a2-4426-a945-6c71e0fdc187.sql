-- Add order_source column to track where orders come from
ALTER TABLE public.orders 
ADD COLUMN order_source text DEFAULT 'classic' CHECK (order_source IN ('classic', 'ramadan', 'traiteur'));

-- Create index for better query performance
CREATE INDEX idx_orders_order_source ON public.orders(order_source);
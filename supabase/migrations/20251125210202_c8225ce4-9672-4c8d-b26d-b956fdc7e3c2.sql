-- Add delivery_date column to orders table
ALTER TABLE public.orders
ADD COLUMN delivery_date timestamp with time zone;

-- Add index for efficient querying of upcoming deliveries
CREATE INDEX idx_orders_delivery_date ON public.orders(delivery_date) WHERE delivered = false;
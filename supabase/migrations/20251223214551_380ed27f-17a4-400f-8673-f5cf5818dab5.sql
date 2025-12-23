-- Fix RLS policies to allow public order creation
-- Drop restrictive policies and recreate as permissive

DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can create order items" ON order_items;

-- Create permissive policies for public order creation
CREATE POLICY "Public can create orders" ON orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can create order items" ON order_items 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);
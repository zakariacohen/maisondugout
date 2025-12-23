-- Fix RLS policies: change from RESTRICTIVE to PERMISSIVE for public order creation

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can create order items" ON order_items;

-- Create PERMISSIVE policies for public order creation
CREATE POLICY "Public can create orders" ON orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can create order items" ON order_items 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);
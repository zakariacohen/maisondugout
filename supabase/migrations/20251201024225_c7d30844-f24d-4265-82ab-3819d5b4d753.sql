-- Update RLS policies to allow public order creation
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;

-- Allow authenticated users to view all orders (admin/staff)
CREATE POLICY "Authenticated users can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (true);

-- Allow public to insert orders (for online ordering)
CREATE POLICY "Public can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to update orders
CREATE POLICY "Authenticated users can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete orders
CREATE POLICY "Authenticated users can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (true);

-- Order items policies
CREATE POLICY "Authenticated users can view order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Public can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (true);
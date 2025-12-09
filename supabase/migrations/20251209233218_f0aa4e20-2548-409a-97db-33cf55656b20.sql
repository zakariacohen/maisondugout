-- Fix orders table RLS policies
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;

CREATE POLICY "Admins can view orders" ON orders FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Fix order_items table RLS policies
DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can delete order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can view order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can delete order items" ON order_items;

CREATE POLICY "Admins can view order items" ON order_items FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete order items" ON order_items FOR DELETE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update order items" ON order_items FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Fix products table RLS policies (keep view for public, restrict modifications)
DROP POLICY IF EXISTS "Anyone can delete products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;

CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (has_role(auth.uid(), 'admin'));
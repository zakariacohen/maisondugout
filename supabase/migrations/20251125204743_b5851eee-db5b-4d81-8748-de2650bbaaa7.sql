-- Add RLS policies to allow authenticated users to manage products
CREATE POLICY "Anyone can insert products"
ON public.products
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update products"
ON public.products
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Anyone can delete products"
ON public.products
FOR DELETE
TO public
USING (true);
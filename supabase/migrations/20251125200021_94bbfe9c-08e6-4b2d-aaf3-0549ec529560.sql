-- Allow deleting order_items so that order updates can replace items instead of duplicating them
CREATE POLICY "Anyone can delete order items"
ON public.order_items
FOR DELETE
USING (true);
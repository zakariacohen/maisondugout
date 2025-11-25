-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  delivered BOOLEAN NOT NULL DEFAULT false,
  delivery_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view orders" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update orders" 
ON public.orders 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete orders" 
ON public.orders 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view order items" 
ON public.order_items 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates on orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for delivery images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('delivery-images', 'delivery-images', true);

-- Create storage policies
CREATE POLICY "Anyone can view delivery images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'delivery-images');

CREATE POLICY "Anyone can upload delivery images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'delivery-images');

CREATE POLICY "Anyone can update delivery images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'delivery-images');

CREATE POLICY "Anyone can delete delivery images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'delivery-images');
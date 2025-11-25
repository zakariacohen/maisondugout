-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (everyone can see products)
CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert products from the menu
INSERT INTO public.products (name, price) VALUES
('بسطيلة الدجاج باللوز والمشماش', 9.00),
('بسطيلة السلمون والسبانغ', 10.00),
('بسطيلة الحوت', 9.00),
('كيش بالسبانغ والسلمون المدخن', 6.50),
('كيش بالبورو والدجاج', 5.50),
('مستطيلات بالكفتة', 6.50),
('بريوة بالكامبا و الخضار', 5.50),
('بريوة بالدجاج والموز', 7.50),
('بريوة الحوت', 6.50),
('بريوة الدجاج بالبسيطو ومطماطم مجففة', 6.00),
('سيكار بالجبن والزعتر', 3.50),
('سيكار دجاج شوارما', 5.50),
('سيكار السبانغ والسلمون المدخن', 6.00),
('سيكار بالدجاج والشاركوتري', 5.50),
('سيكار الجبن (كبيرى)', 3.50);
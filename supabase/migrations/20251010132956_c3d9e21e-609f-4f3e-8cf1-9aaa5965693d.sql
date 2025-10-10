-- Create products table
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  image TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);

-- Only authenticated users can manage products (for admin functionality)
CREATE POLICY "Authenticated users can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (true);

-- Create orders table
CREATE TABLE public.orders (
  id SERIAL PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  class TEXT NOT NULL,
  number TEXT NOT NULL,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone can view orders (you may want to restrict this later)
CREATE POLICY "Anyone can view orders"
ON public.orders
FOR SELECT
USING (true);

-- Anyone can place orders
CREATE POLICY "Anyone can insert orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can update/delete orders (for admin functionality)
CREATE POLICY "Authenticated users can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (true);

-- Create index on product_id for better query performance
CREATE INDEX idx_orders_product_id ON public.orders(product_id);
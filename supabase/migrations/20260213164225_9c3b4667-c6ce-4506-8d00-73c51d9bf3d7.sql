
-- Add user_id column to orders table
ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON public.orders;

-- Create a new INSERT policy that validates ownership
CREATE POLICY "Authenticated users can insert their own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

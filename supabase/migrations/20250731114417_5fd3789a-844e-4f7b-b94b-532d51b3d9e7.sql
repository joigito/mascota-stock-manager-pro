-- Create a public policy to allow unauthenticated users to read basic organization info by slug
-- This enables public store URLs like /tienda/store-name to work for non-authenticated users

CREATE POLICY "Anyone can view organizations by slug for public store access" 
ON public.organizations 
FOR SELECT 
USING (true);
-- Drop the existing unique constraint
ALTER TABLE public.products DROP CONSTRAINT unique_product_per_user;

-- Create a new unique constraint that includes organization_id
ALTER TABLE public.products ADD CONSTRAINT unique_product_per_user_org 
UNIQUE (name, category, user_id, organization_id);
-- Add foreign key constraints with CASCADE DELETE to allow organization deletion
-- First, add the foreign key constraint to user_organizations
ALTER TABLE public.user_organizations 
DROP CONSTRAINT IF EXISTS user_organizations_organization_id_fkey;

ALTER TABLE public.user_organizations 
ADD CONSTRAINT user_organizations_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add foreign key constraint to organization_invitations
ALTER TABLE public.organization_invitations 
DROP CONSTRAINT IF EXISTS organization_invitations_organization_id_fkey;

ALTER TABLE public.organization_invitations 
ADD CONSTRAINT organization_invitations_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add foreign key constraint to products
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_organization_id_fkey;

ALTER TABLE public.products 
ADD CONSTRAINT products_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add foreign key constraint to sales
ALTER TABLE public.sales 
DROP CONSTRAINT IF EXISTS sales_organization_id_fkey;

ALTER TABLE public.sales 
ADD CONSTRAINT sales_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add foreign key constraint to customers
ALTER TABLE public.customers 
DROP CONSTRAINT IF EXISTS customers_organization_id_fkey;

ALTER TABLE public.customers 
ADD CONSTRAINT customers_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
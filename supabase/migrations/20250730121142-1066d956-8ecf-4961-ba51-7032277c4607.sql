-- Phase 2: Data Migration and Super Admin Setup

-- Add organization_id columns to existing tables
ALTER TABLE public.products ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.sales ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.customers ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Create default organization "LA QUERENCIA"
INSERT INTO public.organizations (name, description, created_by)
VALUES (
  'LA QUERENCIA',
  'Organización por defecto',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
);

-- Get the default organization ID and first user ID
DO $$
DECLARE
  default_org_id UUID;
  first_user_id UUID;
BEGIN
  -- Get the default organization
  SELECT id INTO default_org_id FROM public.organizations WHERE name = 'LA QUERENCIA';
  
  -- Get the first user (existing user)
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  
  -- Assign super_admin role to the first user
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (first_user_id, 'super_admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Add user to default organization as admin
  INSERT INTO public.user_organizations (user_id, organization_id, role)
  VALUES (first_user_id, default_org_id, 'admin')
  ON CONFLICT (user_id, organization_id) DO NOTHING;
  
  -- Migrate existing products to default organization
  UPDATE public.products 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;
  
  -- Migrate existing sales to default organization
  UPDATE public.sales 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;
  
  -- Migrate existing customers to default organization
  UPDATE public.customers 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;
END $$;

-- Make organization_id NOT NULL after migration
ALTER TABLE public.products ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.sales ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.customers ALTER COLUMN organization_id SET NOT NULL;

-- Update RLS policies to include organization filtering

-- Drop existing policies and recreate with organization filtering
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

-- Products policies with organization filtering
CREATE POLICY "Users can view their org products" ON public.products
FOR SELECT USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can insert org products" ON public.products
FOR INSERT WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can update their org products" ON public.products
FOR UPDATE USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can delete their org products" ON public.products
FOR DELETE USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

-- Sales policies
DROP POLICY IF EXISTS "Users can view their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can create their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON public.sales;

CREATE POLICY "Users can view their org sales" ON public.sales
FOR SELECT USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can create org sales" ON public.sales
FOR INSERT WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can update their org sales" ON public.sales
FOR UPDATE USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can delete their org sales" ON public.sales
FOR DELETE USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

-- Customers policies
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

CREATE POLICY "Users can view their org customers" ON public.customers
FOR SELECT USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can create org customers" ON public.customers
FOR INSERT WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can update their org customers" ON public.customers
FOR UPDATE USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

CREATE POLICY "Users can delete their org customers" ON public.customers
FOR DELETE USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

-- Create function to get user's default organization
CREATE OR REPLACE FUNCTION public.get_user_default_organization(user_uuid UUID)
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT organization_id 
  FROM public.user_organizations 
  WHERE user_id = user_uuid 
  ORDER BY created_at 
  LIMIT 1;
$$;
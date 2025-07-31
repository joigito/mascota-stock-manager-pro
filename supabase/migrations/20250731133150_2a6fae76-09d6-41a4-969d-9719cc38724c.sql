-- Update RLS policies for products table to allow super admin access

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their org products" ON public.products;
DROP POLICY IF EXISTS "Users can insert org products" ON public.products;
DROP POLICY IF EXISTS "Users can update their org products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their org products" ON public.products;

-- Create new policies that include super admin access
CREATE POLICY "Users can view their org products or super admins can view all"
ON public.products
FOR SELECT
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can insert org products or super admins can insert anywhere"
ON public.products
FOR INSERT
WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can update their org products or super admins can update all"
ON public.products
FOR UPDATE
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can delete their org products or super admins can delete all"
ON public.products
FOR DELETE
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Also update sales policies to be consistent
DROP POLICY IF EXISTS "Users can view their org sales" ON public.sales;
DROP POLICY IF EXISTS "Users can create org sales" ON public.sales;
DROP POLICY IF EXISTS "Users can update their org sales" ON public.sales;
DROP POLICY IF EXISTS "Users can delete their org sales" ON public.sales;

CREATE POLICY "Users can view their org sales or super admins can view all"
ON public.sales
FOR SELECT
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can create org sales or super admins can create anywhere"
ON public.sales
FOR INSERT
WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can update their org sales or super admins can update all"
ON public.sales
FOR UPDATE
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can delete their org sales or super admins can delete all"
ON public.sales
FOR DELETE
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Update customers policies too
DROP POLICY IF EXISTS "Users can view their org customers" ON public.customers;
DROP POLICY IF EXISTS "Users can create org customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their org customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their org customers" ON public.customers;

CREATE POLICY "Users can view their org customers or super admins can view all"
ON public.customers
FOR SELECT
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can create org customers or super admins can create anywhere"
ON public.customers
FOR INSERT
WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can update their org customers or super admins can update all"
ON public.customers
FOR UPDATE
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Users can delete their org customers or super admins can delete all"
ON public.customers
FOR DELETE
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);
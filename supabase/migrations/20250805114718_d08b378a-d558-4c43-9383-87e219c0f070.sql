-- Fix RLS policies to allow all organization members (not just admins) to access data

-- Drop existing policies for products
DROP POLICY IF EXISTS "Users can view their org products or super admins can view all" ON products;
DROP POLICY IF EXISTS "Users can insert org products or super admins can insert anywhe" ON products;
DROP POLICY IF EXISTS "Users can update their org products or super admins can update" ON products;
DROP POLICY IF EXISTS "Users can delete their org products or super admins can delete" ON products;

-- Create new policies for products allowing all organization members
CREATE POLICY "Organization members can view products" 
ON products FOR SELECT 
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can insert products" 
ON products FOR INSERT 
WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can update products" 
ON products FOR UPDATE 
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can delete products" 
ON products FOR DELETE 
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Fix sales policies
DROP POLICY IF EXISTS "Users can view their org sales or super admins can view all" ON sales;
DROP POLICY IF EXISTS "Users can create org sales or super admins can create anywhere" ON sales;
DROP POLICY IF EXISTS "Users can update their org sales or super admins can update all" ON sales;
DROP POLICY IF EXISTS "Users can delete their org sales or super admins can delete all" ON sales;

CREATE POLICY "Organization members can view sales" 
ON sales FOR SELECT 
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can create sales" 
ON sales FOR INSERT 
WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can update sales" 
ON sales FOR UPDATE 
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can delete sales" 
ON sales FOR DELETE 
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Fix customers policies
DROP POLICY IF EXISTS "Users can view their org customers or super admins can view all" ON customers;
DROP POLICY IF EXISTS "Users can create org customers or super admins can create anywh" ON customers;
DROP POLICY IF EXISTS "Users can update their org customers or super admins can update" ON customers;
DROP POLICY IF EXISTS "Users can delete their org customers or super admins can delete" ON customers;

CREATE POLICY "Organization members can view customers" 
ON customers FOR SELECT 
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can create customers" 
ON customers FOR INSERT 
WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can update customers" 
ON customers FOR UPDATE 
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can delete customers" 
ON customers FOR DELETE 
USING (
  user_belongs_to_org(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);
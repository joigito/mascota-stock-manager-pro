
-- 1. Enable RLS and add organization-scoped policies on variant tables

ALTER TABLE public.product_attribute_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view product attribute definitions"
ON public.product_attribute_definitions FOR SELECT
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can insert product attribute definitions"
ON public.product_attribute_definitions FOR INSERT
WITH CHECK (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can update product attribute definitions"
ON public.product_attribute_definitions FOR UPDATE
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can delete product attribute definitions"
ON public.product_attribute_definitions FOR DELETE
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER TABLE public.product_variant_combinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view product variant combinations"
ON public.product_variant_combinations FOR SELECT
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can insert product variant combinations"
ON public.product_variant_combinations FOR INSERT
WITH CHECK (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can update product variant combinations"
ON public.product_variant_combinations FOR UPDATE
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can delete product variant combinations"
ON public.product_variant_combinations FOR DELETE
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER TABLE public.product_variant_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view product variant attributes"
ON public.product_variant_attributes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.product_variant_combinations c
  WHERE c.id = product_variant_attributes.variant_combination_id
    AND (user_belongs_to_org(auth.uid(), c.organization_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Organization members can insert product variant attributes"
ON public.product_variant_attributes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.product_variant_combinations c
  WHERE c.id = product_variant_attributes.variant_combination_id
    AND (user_belongs_to_org(auth.uid(), c.organization_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Organization members can update product variant attributes"
ON public.product_variant_attributes FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.product_variant_combinations c
  WHERE c.id = product_variant_attributes.variant_combination_id
    AND (user_belongs_to_org(auth.uid(), c.organization_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Organization members can delete product variant attributes"
ON public.product_variant_attributes FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.product_variant_combinations c
  WHERE c.id = product_variant_attributes.variant_combination_id
    AND (user_belongs_to_org(auth.uid(), c.organization_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

-- 2. Fix privilege escalation: remove the flawed permissive ALL policy on user_roles
DROP POLICY IF EXISTS "Users cannot modify their own roles" ON public.user_roles;

-- 3. Align sale_items policies with sales (organization-scoped)
DROP POLICY IF EXISTS "Users can view their sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Users can create sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Users can update their sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Users can delete their sale items" ON public.sale_items;

CREATE POLICY "Organization members can view sale items"
ON public.sale_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.sales s
  WHERE s.id = sale_items.sale_id
    AND (user_belongs_to_org(auth.uid(), s.organization_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Organization members can create sale items"
ON public.sale_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.sales s
  WHERE s.id = sale_items.sale_id
    AND (user_belongs_to_org(auth.uid(), s.organization_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Organization members can update sale items"
ON public.sale_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.sales s
  WHERE s.id = sale_items.sale_id
    AND (user_belongs_to_org(auth.uid(), s.organization_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Organization members can delete sale items"
ON public.sale_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.sales s
  WHERE s.id = sale_items.sale_id
    AND (is_organization_admin(auth.uid(), s.organization_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

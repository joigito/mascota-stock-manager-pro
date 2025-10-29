-- Migration: add RLS policies for variant_attribute_definitions
-- Date: 2025-10-28
--
-- Assumption: there is a table public.organization_users(organization_id uuid, user_id uuid)
-- which links users to organizations. If your project uses a different table/name,
-- update the policy queries accordingly before applying.

-- Enable Row Level Security
ALTER TABLE IF EXISTS public.variant_attribute_definitions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if present, then create the select policy
DROP POLICY IF EXISTS "VariantAttr_select_org_members" ON public.variant_attribute_definitions;
CREATE POLICY "VariantAttr_select_org_members"
ON public.variant_attribute_definitions
FOR SELECT
USING (
  auth.role() = 'service_role' OR public.user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Allow INSERT if the authenticated user is a member of the organization (or service_role)
DROP POLICY IF EXISTS "VariantAttr_insert_org_members" ON public.variant_attribute_definitions;
CREATE POLICY "VariantAttr_insert_org_members"
ON public.variant_attribute_definitions
FOR INSERT
WITH CHECK (
  auth.role() = 'service_role' OR public.user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Allow UPDATE only for members of the organization (or service_role)
DROP POLICY IF EXISTS "VariantAttr_update_org_members" ON public.variant_attribute_definitions;
CREATE POLICY "VariantAttr_update_org_members"
ON public.variant_attribute_definitions
FOR UPDATE
USING (
  auth.role() = 'service_role' OR public.user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  auth.role() = 'service_role' OR public.user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Allow DELETE only for members of the organization (or service_role)
DROP POLICY IF EXISTS "VariantAttr_delete_org_members" ON public.variant_attribute_definitions;
CREATE POLICY "VariantAttr_delete_org_members"
ON public.variant_attribute_definitions
FOR DELETE
USING (
  auth.role() = 'service_role' OR public.user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- If you need to allow public read access for some reason, add a specific policy for that.

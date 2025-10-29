-- Combined migration: create helper functions + enable RLS + create policies
-- Date: 2025-10-29
-- Run this once in the target database (Supabase SQL editor or psql). It's idempotent
-- (functions use CREATE OR REPLACE; policies are dropped then created).

BEGIN;

--------------------------------------------------------------------------------
-- 1) Helper functions (CREATE OR REPLACE) used by RLS policies
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.get_user_roles(_user_id)
    WHERE role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_default_organization(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT organization_id 
  FROM public.user_organizations 
  WHERE user_id = user_uuid 
  ORDER BY created_at 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = _user_id
      AND organization_id = _org_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_organization_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(role app_role)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = user_uuid;
$function$;

--------------------------------------------------------------------------------
-- 2) Enable RLS and create policies for variant_attribute_definitions
--------------------------------------------------------------------------------

-- Verify the table exists before trying to enable RLS or create policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'variant_attribute_definitions') THEN
    RAISE EXCEPTION 'Table public.variant_attribute_definitions does not exist. Create the table before applying this migration.';
  END IF;
END$$;

-- Enable Row Level Security
ALTER TABLE public.variant_attribute_definitions ENABLE ROW LEVEL SECURITY;

-- DROP / CREATE policies (safe to re-run)
DROP POLICY IF EXISTS "VariantAttr_select_org_members" ON public.variant_attribute_definitions;
CREATE POLICY "VariantAttr_select_org_members"
  ON public.variant_attribute_definitions
  FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR public.user_belongs_to_org(auth.uid(), organization_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

DROP POLICY IF EXISTS "VariantAttr_insert_org_members" ON public.variant_attribute_definitions;
CREATE POLICY "VariantAttr_insert_org_members"
  ON public.variant_attribute_definitions
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR public.user_belongs_to_org(auth.uid(), organization_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

DROP POLICY IF EXISTS "VariantAttr_update_org_members" ON public.variant_attribute_definitions;
CREATE POLICY "VariantAttr_update_org_members"
  ON public.variant_attribute_definitions
  FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR public.user_belongs_to_org(auth.uid(), organization_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR public.user_belongs_to_org(auth.uid(), organization_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

DROP POLICY IF EXISTS "VariantAttr_delete_org_members" ON public.variant_attribute_definitions;
CREATE POLICY "VariantAttr_delete_org_members"
  ON public.variant_attribute_definitions
  FOR DELETE
  USING (
    auth.role() = 'service_role'
    OR public.user_belongs_to_org(auth.uid(), organization_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

COMMIT;

-- End of combined migration

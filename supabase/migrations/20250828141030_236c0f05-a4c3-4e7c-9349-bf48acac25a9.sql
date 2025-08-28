-- Fix privilege escalation vulnerability in user_roles table
-- Current policy allows super admins to manage ALL roles, including their own
-- This creates a risk where a user could potentially elevate their own privileges

-- First, let's see the current policies
-- DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Create more secure policies that prevent self-privilege escalation
CREATE POLICY "Super admins can assign roles to others" 
ON public.user_roles 
FOR INSERT 
USING (
  -- Only allow if the requesting user has super_admin role
  has_role(auth.uid(), 'super_admin'::app_role) AND
  -- Prevent users from assigning super_admin role to themselves
  NOT (user_id = auth.uid() AND role = 'super_admin'::app_role)
);

CREATE POLICY "Super admins can update roles of others" 
ON public.user_roles 
FOR UPDATE 
USING (
  -- Only allow if the requesting user has super_admin role
  has_role(auth.uid(), 'super_admin'::app_role) AND
  -- Prevent users from updating their own super_admin role
  NOT (user_id = auth.uid() AND role = 'super_admin'::app_role)
);

CREATE POLICY "Super admins can delete roles of others" 
ON public.user_roles 
FOR DELETE 
USING (
  -- Only allow if the requesting user has super_admin role
  has_role(auth.uid(), 'super_admin'::app_role) AND
  -- Prevent users from deleting their own super_admin role
  NOT (user_id = auth.uid() AND role = 'super_admin'::app_role)
);

-- Keep the existing view policy for users to see their own roles
-- This should already exist: "Users can view their own roles"

-- Create an audit table for role changes to track privilege escalations
CREATE TABLE IF NOT EXISTS public.user_role_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL,
  changed_by uuid NOT NULL,
  old_role app_role,
  new_role app_role,
  action text NOT NULL, -- 'GRANTED', 'REVOKED', 'UPDATED'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.user_role_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view role audit logs" 
ON public.user_role_audit 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_role_audit (target_user_id, changed_by, new_role, action)
    VALUES (NEW.user_id, auth.uid(), NEW.role, 'GRANTED');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.user_role_audit (target_user_id, changed_by, old_role, new_role, action)
    VALUES (NEW.user_id, auth.uid(), OLD.role, NEW.role, 'UPDATED');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_role_audit (target_user_id, changed_by, old_role, action)
    VALUES (OLD.user_id, auth.uid(), OLD.role, 'REVOKED');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger to log all role changes
CREATE TRIGGER user_role_changes_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();

-- Fix database security issues
-- Update all functions to use proper search path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(role app_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = _user_id
      AND organization_id = _org_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_organization_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_default_organization(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT organization_id 
  FROM public.user_organizations 
  WHERE user_id = user_uuid 
  ORDER BY created_at 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_organization_by_slug(org_slug text)
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  description text
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT o.id, o.name, o.slug, o.description
  FROM public.organizations o
  WHERE o.slug = org_slug;
$$;
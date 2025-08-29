-- Fix Critical Privilege Escalation Vulnerability
-- Drop existing policies and recreate with security fixes
DROP POLICY IF EXISTS "Super admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Prevent users from modifying their own roles (prevents self-promotion)
CREATE POLICY "Users cannot modify their own roles"
ON user_roles
FOR ALL
USING (auth.uid() != user_id);

-- Only allow super admins to manage roles of others, but not their own
CREATE POLICY "Super admins can manage other users roles"
ON user_roles
FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  AND auth.uid() != user_id
);

-- Users can only view their own roles
CREATE POLICY "Users can view their own roles"
ON user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Fix database function search paths for security
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
  )
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
  )
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

-- Restrict tax_conditions access to authenticated users only
DROP POLICY IF EXISTS "Anyone can view tax conditions" ON tax_conditions;
CREATE POLICY "Authenticated users can view tax conditions"
ON tax_conditions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add role change audit logging
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_user_id uuid NOT NULL,
  changed_by_user_id uuid NOT NULL,
  old_role app_role,
  new_role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  action text NOT NULL CHECK (action IN ('granted', 'revoked', 'modified'))
);

-- Enable RLS on audit table
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view role audit logs"
ON role_change_audit
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger to log role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_change_audit (
      changed_user_id, 
      changed_by_user_id, 
      new_role, 
      action
    )
    VALUES (NEW.user_id, auth.uid(), NEW.role, 'granted');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_change_audit (
      changed_user_id, 
      changed_by_user_id, 
      old_role, 
      action
    )
    VALUES (OLD.user_id, auth.uid(), OLD.role, 'revoked');
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.role_change_audit (
      changed_user_id, 
      changed_by_user_id, 
      old_role, 
      new_role, 
      action
    )
    VALUES (NEW.user_id, auth.uid(), OLD.role, NEW.role, 'modified');
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Add trigger to user_roles table
DROP TRIGGER IF EXISTS role_changes_audit_trigger ON user_roles;
CREATE TRIGGER role_changes_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();
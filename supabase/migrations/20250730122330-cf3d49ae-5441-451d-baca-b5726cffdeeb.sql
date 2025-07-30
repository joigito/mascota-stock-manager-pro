-- Create security definer function to check if user is organization admin
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

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Organization admins can manage their org memberships" ON public.user_organizations;

-- Create new policy using the security definer function
CREATE POLICY "Organization admins can manage their org memberships" 
ON public.user_organizations 
FOR ALL
USING (public.is_organization_admin(auth.uid(), organization_id));
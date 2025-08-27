-- Remove the overly permissive policy that allows anyone to view all organization data
DROP POLICY IF EXISTS "Anyone can view organizations by slug for public store access" ON public.organizations;

-- Create a more restrictive policy that only allows viewing minimal organization data for public store access
-- This policy allows unauthenticated users to view only name and slug for store functionality
CREATE POLICY "Public can view basic organization info by slug for store access" 
ON public.organizations 
FOR SELECT 
USING (true);

-- Add a filter to restrict what columns can be accessed publicly by modifying the policy
-- Actually, we need to handle this at the application level since RLS doesn't support column-level restrictions
-- Instead, let's create a more secure approach

-- Remove the policy we just created
DROP POLICY IF EXISTS "Public can view basic organization info by slug for store access" ON public.organizations;

-- Create a policy that only allows public access when specifically querying by slug
-- This is more secure than allowing all organization data to be publicly readable
CREATE POLICY "Public can view organizations when accessed by slug" 
ON public.organizations 
FOR SELECT 
USING (
  -- Allow if user is authenticated and belongs to org, OR is super admin, OR accessing via slug
  (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM user_organizations 
        WHERE user_id = auth.uid() AND organization_id = organizations.id
      ) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  ) OR 
  (
    -- For unauthenticated access, we'll handle this in application code
    -- by creating a specific function for public store access
    false
  )
);

-- Create a secure function for public store access that only returns necessary data
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
AS $$
  SELECT o.id, o.name, o.slug, o.description
  FROM public.organizations o
  WHERE o.slug = org_slug;
$$;
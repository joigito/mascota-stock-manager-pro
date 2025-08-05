-- Create a secure function to get users with their roles and organization data
-- This function uses SECURITY DEFINER to access auth.users table
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow super admins to call this function
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at
  FROM auth.users au
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'
  )
  AND au.id IN (
    -- Only return users who have organization memberships or global roles
    SELECT DISTINCT user_id FROM public.user_organizations
    UNION
    SELECT DISTINCT user_id FROM public.user_roles
  );
$$;
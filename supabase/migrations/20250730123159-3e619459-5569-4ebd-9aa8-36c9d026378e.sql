-- Assign super_admin role to the user
-- Note: Replace with actual user ID after checking auth.users table
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'super_admin'::app_role 
FROM auth.users 
WHERE email = (
  SELECT email FROM auth.users 
  ORDER BY created_at 
  LIMIT 1
)
ON CONFLICT (user_id, role) DO NOTHING;
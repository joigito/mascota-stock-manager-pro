-- Insert super_admin role for the specific user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('26d856f1-b757-4ae1-bd6b-1a7cbc22316d'::uuid, 'super_admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
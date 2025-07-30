-- Insert super_admin role for the current user
INSERT INTO public.user_roles (user_id, role) 
VALUES (auth.uid(), 'super_admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
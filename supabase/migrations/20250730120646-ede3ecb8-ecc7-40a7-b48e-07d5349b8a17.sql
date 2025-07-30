-- Actualizar función generate_invitation_token usando gen_random_uuid
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT replace(gen_random_uuid()::text, '-', '');
$$;
-- Corregir función generate_invitation_token con extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Actualizar función generate_invitation_token con search_path seguro
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT encode(gen_random_bytes(32), 'base64url');
$$;
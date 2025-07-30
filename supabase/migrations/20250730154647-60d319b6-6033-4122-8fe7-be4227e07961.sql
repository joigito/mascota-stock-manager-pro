-- Fix search_path issues for the new functions
-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS trigger_set_organization_slug ON public.organizations;

-- Now drop the functions
DROP FUNCTION IF EXISTS public.set_organization_slug();
DROP FUNCTION IF EXISTS public.generate_slug(text);

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(
    regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_organization_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := public.generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_set_organization_slug
  BEFORE INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_slug();
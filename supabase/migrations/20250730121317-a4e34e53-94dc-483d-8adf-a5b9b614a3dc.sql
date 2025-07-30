-- Fix remaining functions with secure search_path

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update user_belongs_to_org function
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- Update detect_duplicate_products function
CREATE OR REPLACE FUNCTION public.detect_duplicate_products(user_uuid uuid)
RETURNS TABLE(product_name text, category text, duplicate_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT p.name, p.category::text, COUNT(*) as duplicate_count
  FROM public.products p
  WHERE p.user_id = user_uuid
  GROUP BY p.name, p.category, p.user_id
  HAVING COUNT(*) > 1;
END;
$$;

-- Update clean_duplicate_products function
CREATE OR REPLACE FUNCTION public.clean_duplicate_products(user_uuid uuid)
RETURNS TABLE(deleted_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_rows integer;
BEGIN
  WITH duplicates AS (
    SELECT id, name, category, user_id,
           ROW_NUMBER() OVER (PARTITION BY name, category, user_id ORDER BY created_at DESC) as rn
    FROM public.products
    WHERE user_id = user_uuid
  )
  DELETE FROM public.products 
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  RETURN QUERY SELECT deleted_rows;
END;
$$;

-- Update log_product_changes function
CREATE OR REPLACE FUNCTION public.log_product_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.product_audit (product_id, user_id, action, new_data)
        VALUES (NEW.id, NEW.user_id, 'INSERT', row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.product_audit (product_id, user_id, action, old_data, new_data)
        VALUES (NEW.id, NEW.user_id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.product_audit (product_id, user_id, action, old_data)
        VALUES (OLD.id, OLD.user_id, 'DELETE', row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;
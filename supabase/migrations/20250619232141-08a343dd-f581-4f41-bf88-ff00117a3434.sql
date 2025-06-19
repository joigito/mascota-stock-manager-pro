
-- Paso 1: Eliminar productos duplicados manteniendo el más reciente
WITH duplicates AS (
  SELECT id, name, category, user_id,
         ROW_NUMBER() OVER (PARTITION BY name, category, user_id ORDER BY created_at DESC) as rn
  FROM public.products
)
DELETE FROM public.products 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Paso 2: Agregar constraint único para prevenir duplicados futuros
ALTER TABLE public.products 
ADD CONSTRAINT unique_product_per_user 
UNIQUE (name, category, user_id);

-- Paso 3: Crear función para limpiar duplicados manualmente
CREATE OR REPLACE FUNCTION public.clean_duplicate_products(user_uuid uuid)
RETURNS TABLE(deleted_count integer) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 4: Crear función para detectar duplicados
CREATE OR REPLACE FUNCTION public.detect_duplicate_products(user_uuid uuid)
RETURNS TABLE(product_name text, category text, duplicate_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT p.name, p.category::text, COUNT(*) as duplicate_count
  FROM public.products p
  WHERE p.user_id = user_uuid
  GROUP BY p.name, p.category, p.user_id
  HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

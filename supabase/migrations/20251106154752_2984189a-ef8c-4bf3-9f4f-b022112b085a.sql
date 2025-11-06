-- Permitir product_id nullable para items libres (servicios, productos no inventariados, etc)
ALTER TABLE public.sale_items 
ALTER COLUMN product_id DROP NOT NULL;

-- Agregar comentario explicativo
COMMENT ON COLUMN public.sale_items.product_id IS 
'ID del producto. Puede ser NULL para items libres como servicios o productos no inventariados';
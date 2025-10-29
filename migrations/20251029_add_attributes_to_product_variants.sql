-- Add attributes column to product_variants
ALTER TABLE public.product_variants
ADD COLUMN attributes jsonb DEFAULT '{}'::jsonb;

-- Migrate data from color and size to attributes
UPDATE public.product_variants
SET attributes = jsonb_build_object('color', color, 'size', size)
WHERE color IS NOT NULL OR size IS NOT NULL;

-- Remove color and size columns
ALTER TABLE public.product_variants
DROP COLUMN color;

ALTER TABLE public.product_variants
DROP COLUMN size;

-- Add an index to the attributes column
CREATE INDEX IF NOT EXISTS idx_product_variants_attributes ON public.product_variants USING gin(attributes);

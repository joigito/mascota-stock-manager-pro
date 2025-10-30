-- Add a nullable variant_id column to sale_items to associate a sale item with a specific product variant.
ALTER TABLE public.sale_items
ADD COLUMN variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- Add an index for better query performance on variant_id
CREATE INDEX idx_sale_items_variant_id ON public.sale_items(variant_id);

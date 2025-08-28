-- Create product_variants table for color, size, etc.
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  sku text,
  color text,
  size text,
  stock integer NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 0,
  price_adjustment numeric DEFAULT 0,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, color, size)
);

-- Create product_attributes table for flexible attributes
CREATE TABLE public.product_attributes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  attribute_name text NOT NULL,
  attribute_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, attribute_name, attribute_value)
);

-- Add new fields to products table
ALTER TABLE public.products 
ADD COLUMN has_variants boolean NOT NULL DEFAULT false,
ADD COLUMN base_sku text;

-- Enable RLS on new tables
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_variants
CREATE POLICY "Organization members can view product variants" 
ON public.product_variants 
FOR SELECT 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can insert product variants" 
ON public.product_variants 
FOR INSERT 
WITH CHECK (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can update product variants" 
ON public.product_variants 
FOR UPDATE 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can delete product variants" 
ON public.product_variants 
FOR DELETE 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for product_attributes
CREATE POLICY "Organization members can view product attributes" 
ON public.product_attributes 
FOR SELECT 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can insert product attributes" 
ON public.product_attributes 
FOR INSERT 
WITH CHECK (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can update product attributes" 
ON public.product_attributes 
FOR UPDATE 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can delete product attributes" 
ON public.product_attributes 
FOR DELETE 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate total stock including variants
CREATE OR REPLACE FUNCTION public.get_product_total_stock(p_product_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  product_has_variants boolean;
  total_stock integer := 0;
BEGIN
  -- Check if product has variants
  SELECT has_variants INTO product_has_variants
  FROM public.products
  WHERE id = p_product_id;
  
  IF product_has_variants THEN
    -- Sum stock from all active variants
    SELECT COALESCE(SUM(stock), 0) INTO total_stock
    FROM public.product_variants
    WHERE product_id = p_product_id AND is_active = true;
  ELSE
    -- Get stock from main product
    SELECT stock INTO total_stock
    FROM public.products
    WHERE id = p_product_id;
  END IF;
  
  RETURN total_stock;
END;
$function$;

-- Function to update variant batches after sale (FIFO)
CREATE OR REPLACE FUNCTION public.update_variant_batches_after_sale(
  p_product_id uuid, 
  p_organization_id uuid, 
  p_variant_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  remaining_qty INTEGER := p_quantity;
  batch_rec RECORD;
  used_qty INTEGER;
BEGIN
  -- Update batches for specific variant (FIFO)
  FOR batch_rec IN 
    SELECT * FROM public.product_batches
    WHERE product_id = p_product_id 
      AND organization_id = p_organization_id
      AND quantity_remaining > 0
    ORDER BY batch_date ASC, created_at ASC
    FOR UPDATE
  LOOP
    IF remaining_qty <= 0 THEN
      EXIT;
    END IF;
    
    used_qty := LEAST(batch_rec.quantity_remaining, remaining_qty);
    
    UPDATE public.product_batches
    SET quantity_remaining = quantity_remaining - used_qty,
        updated_at = now()
    WHERE id = batch_rec.id;
    
    remaining_qty := remaining_qty - used_qty;
  END LOOP;
  
  -- Update variant stock
  UPDATE public.product_variants
  SET stock = stock - p_quantity,
      updated_at = now()
  WHERE id = p_variant_id;
END;
$function$;
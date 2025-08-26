-- Crear tabla de historial de precios
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  old_cost_price NUMERIC,
  new_cost_price NUMERIC,
  old_selling_price NUMERIC,
  new_selling_price NUMERIC,
  changed_by UUID NOT NULL,
  reason TEXT DEFAULT 'Manual update',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de lotes de productos
CREATE TABLE public.product_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  purchase_price NUMERIC NOT NULL,
  quantity_purchased INTEGER NOT NULL,
  quantity_remaining INTEGER NOT NULL,
  batch_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  supplier TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies para price_history
CREATE POLICY "Organization members can view price history" 
ON public.price_history 
FOR SELECT 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can create price history" 
ON public.price_history 
FOR INSERT 
WITH CHECK (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies para product_batches
CREATE POLICY "Organization members can view product batches" 
ON public.product_batches 
FOR SELECT 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can create product batches" 
ON public.product_batches 
FOR INSERT 
WITH CHECK (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can update product batches" 
ON public.product_batches 
FOR UPDATE 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can delete product batches" 
ON public.product_batches 
FOR DELETE 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger para actualizar updated_at en product_batches
CREATE TRIGGER update_product_batches_updated_at
  BEFORE UPDATE ON public.product_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para calcular el costo FIFO de una venta
CREATE OR REPLACE FUNCTION public.calculate_fifo_cost(
  p_product_id UUID,
  p_organization_id UUID,
  p_quantity INTEGER
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_cost NUMERIC := 0;
  remaining_qty INTEGER := p_quantity;
  batch_rec RECORD;
  used_qty INTEGER;
BEGIN
  -- Obtener lotes ordenados por fecha (FIFO)
  FOR batch_rec IN 
    SELECT * FROM public.product_batches
    WHERE product_id = p_product_id 
      AND organization_id = p_organization_id
      AND quantity_remaining > 0
    ORDER BY batch_date ASC, created_at ASC
  LOOP
    IF remaining_qty <= 0 THEN
      EXIT;
    END IF;
    
    used_qty := LEAST(batch_rec.quantity_remaining, remaining_qty);
    total_cost := total_cost + (used_qty * batch_rec.purchase_price);
    remaining_qty := remaining_qty - used_qty;
  END LOOP;
  
  RETURN total_cost;
END;
$$;

-- Función para actualizar lotes después de una venta
CREATE OR REPLACE FUNCTION public.update_batches_after_sale(
  p_product_id UUID,
  p_organization_id UUID,
  p_quantity INTEGER
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  remaining_qty INTEGER := p_quantity;
  batch_rec RECORD;
  used_qty INTEGER;
BEGIN
  -- Actualizar lotes ordenados por fecha (FIFO)
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
END;
$$;
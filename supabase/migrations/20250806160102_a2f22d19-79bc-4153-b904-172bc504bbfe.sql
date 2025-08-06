-- Crear tabla para configuraciones del sistema
CREATE TABLE public.system_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  config_type TEXT NOT NULL, -- 'category_settings', 'unit_settings', 'stock_settings', 'margin_settings'
  config_key TEXT NOT NULL, -- clave específica de la configuración
  config_value JSONB NOT NULL, -- valor de la configuración
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE (organization_id, config_type, config_key)
);

-- Habilitar RLS
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Organization members can view system configurations"
ON public.system_configurations
FOR SELECT
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization admins can manage system configurations"
ON public.system_configurations
FOR ALL
USING (is_organization_admin(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_system_configurations_updated_at
BEFORE UPDATE ON public.system_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear nuevas categorías predefinidas (expandiendo el enum existente)
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'electronica';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'ropa';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'hogar';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'alimentacion';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'salud';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'deportes';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'libros';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'vehiculos';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'servicios';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'otros';

-- Insertar configuraciones predeterminadas para unidades de medida
INSERT INTO public.system_configurations (organization_id, config_type, config_key, config_value, created_by) 
SELECT 
  o.id,
  'unit_settings',
  'available_units',
  '["unidades", "kg", "litros", "metros", "gramos", "toneladas", "cajas", "docenas", "paquetes"]'::jsonb,
  o.created_by
FROM public.organizations o
ON CONFLICT (organization_id, config_type, config_key) DO NOTHING;

-- Insertar configuraciones predeterminadas para márgenes por categoría
INSERT INTO public.system_configurations (organization_id, config_type, config_key, config_value, created_by)
SELECT 
  o.id,
  'margin_settings',
  'category_margins',
  '{
    "mascotas": 25,
    "forrajeria": 20,
    "electronica": 30,
    "ropa": 40,
    "hogar": 35,
    "alimentacion": 15,
    "salud": 25,
    "deportes": 30,
    "libros": 45,
    "vehiculos": 20,
    "servicios": 50,
    "otros": 25
  }'::jsonb,
  o.created_by
FROM public.organizations o
ON CONFLICT (organization_id, config_type, config_key) DO NOTHING;

-- Insertar configuraciones predeterminadas para stock mínimo por categoría
INSERT INTO public.system_configurations (organization_id, config_type, config_key, config_value, created_by)
SELECT 
  o.id,
  'stock_settings',
  'category_min_stock',
  '{
    "mascotas": 5,
    "forrajeria": 10,
    "electronica": 2,
    "ropa": 5,
    "hogar": 3,
    "alimentacion": 15,
    "salud": 5,
    "deportes": 3,
    "libros": 2,
    "vehiculos": 1,
    "servicios": 0,
    "otros": 5
  }'::jsonb,
  o.created_by
FROM public.organizations o
ON CONFLICT (organization_id, config_type, config_key) DO NOTHING;
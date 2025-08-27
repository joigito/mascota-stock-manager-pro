-- Agregar campo de habilitación de facturación electrónica a organizaciones
ALTER TABLE public.organizations 
ADD COLUMN electronic_invoicing_enabled BOOLEAN NOT NULL DEFAULT false;

-- Crear tabla de configuraciones AFIP por organización
CREATE TABLE public.afip_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  cuit TEXT NOT NULL,
  punto_venta INTEGER NOT NULL DEFAULT 1,
  razon_social TEXT NOT NULL,
  condicion_iva TEXT NOT NULL DEFAULT 'responsable_inscripto',
  domicilio_comercial TEXT,
  ambiente TEXT NOT NULL DEFAULT 'testing', -- 'testing' o 'production'
  certificado_path TEXT, -- Path al certificado en secrets
  clave_privada_path TEXT, -- Path a la clave privada en secrets
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, punto_venta)
);

-- Habilitar RLS en afip_configurations
ALTER TABLE public.afip_configurations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para afip_configurations
CREATE POLICY "Organization members can view AFIP configurations"
ON public.afip_configurations FOR SELECT
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization admins can create AFIP configurations"
ON public.afip_configurations FOR INSERT
WITH CHECK (is_organization_admin(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization admins can update AFIP configurations"
ON public.afip_configurations FOR UPDATE
USING (is_organization_admin(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization admins can delete AFIP configurations"
ON public.afip_configurations FOR DELETE
USING (is_organization_admin(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Crear tabla de condiciones tributarias para clientes
CREATE TABLE public.tax_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  requires_cuit BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar condiciones tributarias básicas
INSERT INTO public.tax_conditions (code, description, requires_cuit) VALUES
('CF', 'Consumidor Final', false),
('RI', 'Responsable Inscripto', true),
('EX', 'Exento', true),
('NR', 'No Responsable', false),
('MT', 'Monotributo', true);

-- Habilitar RLS en tax_conditions (solo lectura para todos)
ALTER TABLE public.tax_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tax conditions"
ON public.tax_conditions FOR SELECT
USING (true);

-- Agregar campos fiscales a la tabla customers
ALTER TABLE public.customers 
ADD COLUMN cuit_dni TEXT,
ADD COLUMN tax_condition_code TEXT DEFAULT 'CF' REFERENCES public.tax_conditions(code),
ADD COLUMN fiscal_address TEXT;

-- Crear tabla de facturas
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  invoice_number BIGINT NOT NULL,
  punto_venta INTEGER NOT NULL,
  tipo_comprobante INTEGER NOT NULL, -- Código AFIP del tipo de comprobante
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  cae TEXT, -- Código de Autorización Electrónico
  fecha_vto_cae DATE, -- Fecha de vencimiento del CAE
  importe_total NUMERIC(15,2) NOT NULL,
  importe_neto NUMERIC(15,2) NOT NULL,
  importe_iva NUMERIC(15,2) NOT NULL DEFAULT 0,
  importe_exento NUMERIC(15,2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'authorized', 'rejected', 'cancelled'
  observaciones TEXT,
  qr_data TEXT, -- Datos para el código QR
  pdf_path TEXT, -- Path al PDF generado
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, punto_venta, invoice_number)
);

-- Habilitar RLS en invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para invoices
CREATE POLICY "Organization members can view invoices"
ON public.invoices FOR SELECT
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can create invoices"
ON public.invoices FOR INSERT
WITH CHECK (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can update invoices"
ON public.invoices FOR UPDATE
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Only admins can delete invoices"
ON public.invoices FOR DELETE
USING (is_organization_admin(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Crear tabla de detalles de IVA por factura
CREATE TABLE public.invoice_tax_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  alicuota_iva NUMERIC(5,2) NOT NULL, -- Ej: 21.00, 10.50
  base_imponible NUMERIC(15,2) NOT NULL,
  importe_iva NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en invoice_tax_details
ALTER TABLE public.invoice_tax_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view invoice tax details"
ON public.invoice_tax_details FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.invoices i 
  WHERE i.id = invoice_tax_details.invoice_id 
  AND (user_belongs_to_org(auth.uid(), i.organization_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Organization members can create invoice tax details"
ON public.invoice_tax_details FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.invoices i 
  WHERE i.id = invoice_tax_details.invoice_id 
  AND (user_belongs_to_org(auth.uid(), i.organization_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

-- Crear trigger para updated_at en afip_configurations
CREATE TRIGGER update_afip_configurations_updated_at
  BEFORE UPDATE ON public.afip_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear trigger para updated_at en invoices
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
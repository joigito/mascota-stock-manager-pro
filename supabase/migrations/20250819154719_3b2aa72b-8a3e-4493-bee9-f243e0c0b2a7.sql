-- Create custom_categories table
CREATE TABLE public.custom_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(organization_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_categories
CREATE POLICY "Organization members can view custom categories" 
ON public.custom_categories 
FOR SELECT 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can create custom categories" 
ON public.custom_categories 
FOR INSERT 
WITH CHECK (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can update custom categories" 
ON public.custom_categories 
FOR UPDATE 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Organization members can delete custom categories" 
ON public.custom_categories 
FOR DELETE 
USING (user_belongs_to_org(auth.uid(), organization_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Modify products table to use text instead of enum for category
ALTER TABLE public.products ALTER COLUMN category TYPE text;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_categories_updated_at
BEFORE UPDATE ON public.custom_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to migrate existing categories for organizations
CREATE OR REPLACE FUNCTION public.migrate_organization_categories(_org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  category_config JSONB;
  category_text TEXT;
BEGIN
  -- Get enabled categories from system_configurations
  SELECT config_value INTO category_config
  FROM public.system_configurations
  WHERE organization_id = _org_id 
    AND config_type = 'categories' 
    AND config_key = 'enabled_categories';

  -- If categories exist, create custom categories for each one
  IF category_config IS NOT NULL THEN
    FOR category_text IN SELECT jsonb_array_elements_text(category_config)
    LOOP
      INSERT INTO public.custom_categories (organization_id, name, created_by)
      VALUES (_org_id, category_text, _org_id)
      ON CONFLICT (organization_id, name) DO NOTHING;
    END LOOP;
  END IF;
END;
$$;
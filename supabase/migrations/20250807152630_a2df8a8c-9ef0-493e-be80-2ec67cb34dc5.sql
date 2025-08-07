-- Update the main organization to professional branding
UPDATE public.organizations 
SET 
  name = 'Sistemas de Gestión Comercial',
  slug = 'sistemas-gestion',
  description = 'Plataforma de gestión comercial para múltiples tipos de negocio'
WHERE slug = 'la-querencia';

-- If sistemas-gestion already exists, use an alternative
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.organizations WHERE slug = 'sistemas-gestion') THEN
    UPDATE public.organizations 
    SET 
      name = 'Sistemas de Gestión Comercial',
      slug = 'gestion-comercial',
      description = 'Plataforma de gestión comercial para múltiples tipos de negocio'
    WHERE slug = 'la-querencia';
  END IF;
END $$;
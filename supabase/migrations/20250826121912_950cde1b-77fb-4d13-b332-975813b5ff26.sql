-- Actualizar política de eliminación de ventas para restringir solo a admins y super admins
DROP POLICY IF EXISTS "Organization members can delete sales" ON public.sales;

-- Crear nueva política que solo permite a admins de organización y super admins eliminar ventas
CREATE POLICY "Only organization admins and super admins can delete sales" 
ON public.sales 
FOR DELETE 
USING (
  is_organization_admin(auth.uid(), organization_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);
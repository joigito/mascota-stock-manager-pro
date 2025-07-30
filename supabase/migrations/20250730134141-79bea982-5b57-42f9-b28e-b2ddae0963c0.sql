-- Add DELETE policy for organizations
CREATE POLICY "Super admins can delete organizations" 
ON public.organizations 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));
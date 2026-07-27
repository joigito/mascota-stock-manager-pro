
CREATE TABLE public.organization_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (organization_id, feature_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_features TO authenticated;
GRANT ALL ON public.organization_features TO service_role;

ALTER TABLE public.organization_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org features"
  ON public.organization_features FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.user_belongs_to_org(auth.uid(), organization_id)
  );

CREATE POLICY "Super admins and org admins can insert features"
  ON public.organization_features FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin')
    OR public.is_organization_admin(auth.uid(), organization_id)
  );

CREATE POLICY "Super admins and org admins can update features"
  ON public.organization_features FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.is_organization_admin(auth.uid(), organization_id)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin')
    OR public.is_organization_admin(auth.uid(), organization_id)
  );

CREATE POLICY "Super admins and org admins can delete features"
  ON public.organization_features FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.is_organization_admin(auth.uid(), organization_id)
  );

CREATE TRIGGER update_organization_features_updated_at
  BEFORE UPDATE ON public.organization_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

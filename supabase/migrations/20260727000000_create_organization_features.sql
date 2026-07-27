-- Create organization_features table for per-tenant feature flags
CREATE TABLE organization_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, feature_key)
);

-- Enable RLS
ALTER TABLE organization_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organization members can view features"
ON organization_features FOR SELECT
TO authenticated
USING (
  user_belongs_to_org(auth.uid(), organization_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization admins can insert features"
ON organization_features FOR INSERT
TO authenticated
WITH CHECK (
  is_organization_admin(organization_id, auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization admins can update features"
ON organization_features FOR UPDATE
TO authenticated
USING (
  is_organization_admin(organization_id, auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization admins can delete features"
ON organization_features FOR DELETE
TO authenticated
USING (
  is_organization_admin(organization_id, auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Trigger to update updated_at
CREATE TRIGGER update_organization_features_updated_at
BEFORE UPDATE ON organization_features
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_organization_features_org ON organization_features(organization_id);
CREATE INDEX idx_organization_features_key ON organization_features(feature_key);

-- Migrate existing data from organizations columns
INSERT INTO organization_features (organization_id, feature_key, enabled)
SELECT id, 'electronic_invoicing', electronic_invoicing_enabled
FROM organizations
WHERE electronic_invoicing_enabled = true;

INSERT INTO organization_features (organization_id, feature_key, enabled)
SELECT id, 'current_account', current_account_enabled
FROM organizations
WHERE current_account_enabled = true;

INSERT INTO organization_features (organization_id, feature_key, enabled)
SELECT id, 'use_variants', use_variants
FROM organizations
WHERE use_variants = true;

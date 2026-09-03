-- Create suppliers table for per-tenant supplier management
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  contact_info TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (same pattern as custom_categories)
CREATE POLICY "Organization members can view suppliers"
ON suppliers FOR SELECT
TO authenticated
USING (
  user_belongs_to_org(auth.uid(), organization_id)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization admins can insert suppliers"
ON suppliers FOR INSERT
TO authenticated
WITH CHECK (
  is_organization_admin(organization_id, auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization admins can update suppliers"
ON suppliers FOR UPDATE
TO authenticated
USING (
  is_organization_admin(organization_id, auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization admins can delete suppliers"
ON suppliers FOR DELETE
TO authenticated
USING (
  is_organization_admin(organization_id, auth.uid())
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Trigger to update updated_at
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_suppliers_org ON suppliers(organization_id);
CREATE INDEX idx_suppliers_name ON suppliers(name);

-- Add supplier_id to products (nullable FK, products may have no supplier)
ALTER TABLE products
ADD COLUMN supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

CREATE INDEX idx_products_supplier ON products(supplier_id);

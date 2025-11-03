-- Add current_account_enabled field to organizations
ALTER TABLE organizations 
ADD COLUMN current_account_enabled BOOLEAN NOT NULL DEFAULT false;

-- Create customer_accounts table to track balance per customer
CREATE TABLE customer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  credit_limit NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(customer_id, organization_id)
);

-- Create account_transactions table for all movements
CREATE TABLE account_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_account_id UUID NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'payment', 'adjustment')),
  amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  reference_id UUID,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE customer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_accounts
CREATE POLICY "Organization members can view customer accounts"
ON customer_accounts FOR SELECT
TO authenticated
USING (
  user_belongs_to_org(auth.uid(), organization_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can create customer accounts"
ON customer_accounts FOR INSERT
TO authenticated
WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can update customer accounts"
ON customer_accounts FOR UPDATE
TO authenticated
USING (
  user_belongs_to_org(auth.uid(), organization_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for account_transactions
CREATE POLICY "Organization members can view account transactions"
ON account_transactions FOR SELECT
TO authenticated
USING (
  user_belongs_to_org(auth.uid(), organization_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can create account transactions"
ON account_transactions FOR INSERT
TO authenticated
WITH CHECK (
  user_belongs_to_org(auth.uid(), organization_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Trigger to update updated_at on customer_accounts
CREATE TRIGGER update_customer_accounts_updated_at
BEFORE UPDATE ON customer_accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_customer_accounts_customer ON customer_accounts(customer_id);
CREATE INDEX idx_customer_accounts_org ON customer_accounts(organization_id);
CREATE INDEX idx_account_transactions_account ON account_transactions(customer_account_id);
CREATE INDEX idx_account_transactions_org ON account_transactions(organization_id);
CREATE INDEX idx_account_transactions_created ON account_transactions(created_at DESC);
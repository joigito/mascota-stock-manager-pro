-- RLS Policies for account_transactions

CREATE POLICY "Organization members can update account transactions"
ON account_transactions FOR UPDATE
TO authenticated
USING (
  user_belongs_to_org(auth.uid(), organization_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Organization members can delete account transactions"
ON account_transactions FOR DELETE
TO authenticated
USING (
  user_belongs_to_org(auth.uid(), organization_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

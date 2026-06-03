
-- Add public_token to customer_accounts
ALTER TABLE public.customer_accounts
  ADD COLUMN IF NOT EXISTS public_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS customer_accounts_public_token_key
  ON public.customer_accounts(public_token);

-- Public RPC: returns full statement data for a given (org slug, token).
-- SECURITY DEFINER so unauthenticated users can read without exposing the tables directly.
CREATE OR REPLACE FUNCTION public.get_public_account_statement(_slug text, _token uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_account_id uuid;
  v_org_id uuid;
BEGIN
  SELECT ca.id, ca.organization_id
    INTO v_account_id, v_org_id
  FROM public.customer_accounts ca
  JOIN public.organizations o ON o.id = ca.organization_id
  WHERE ca.public_token = _token
    AND o.slug = _slug
  LIMIT 1;

  IF v_account_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'organization', (
      SELECT jsonb_build_object('id', o.id, 'name', o.name, 'slug', o.slug)
      FROM public.organizations o WHERE o.id = v_org_id
    ),
    'customer', (
      SELECT jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'cuit_dni', c.cuit_dni,
        'email', c.email,
        'phone', c.phone,
        'fiscal_address', c.fiscal_address
      )
      FROM public.customer_accounts ca
      JOIN public.customers c ON c.id = ca.customer_id
      WHERE ca.id = v_account_id
    ),
    'account', (
      SELECT jsonb_build_object(
        'id', ca.id,
        'balance', ca.balance,
        'credit_limit', ca.credit_limit
      )
      FROM public.customer_accounts ca
      WHERE ca.id = v_account_id
    ),
    'transactions', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'transaction_type', t.transaction_type,
          'amount', t.amount,
          'balance_after', t.balance_after,
          'notes', t.notes,
          'created_at', t.created_at
        )
        ORDER BY t.created_at DESC
      )
      FROM public.account_transactions t
      WHERE t.customer_account_id = v_account_id
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_account_statement(text, uuid) TO anon, authenticated;

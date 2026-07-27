
-- 1) product_attribute_values: enable RLS + policies
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view attribute values"
  ON public.product_attribute_values FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.product_attribute_definitions pad
      WHERE pad.id = product_attribute_values.attribute_definition_id
        AND (
          public.has_role(auth.uid(), 'super_admin')
          OR public.user_belongs_to_org(auth.uid(), pad.organization_id)
        )
    )
  );

CREATE POLICY "Org admins can insert attribute values"
  ON public.product_attribute_values FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.product_attribute_definitions pad
      WHERE pad.id = product_attribute_values.attribute_definition_id
        AND (
          public.has_role(auth.uid(), 'super_admin')
          OR public.is_organization_admin(auth.uid(), pad.organization_id)
        )
    )
  );

CREATE POLICY "Org admins can update attribute values"
  ON public.product_attribute_values FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.product_attribute_definitions pad
      WHERE pad.id = product_attribute_values.attribute_definition_id
        AND (
          public.has_role(auth.uid(), 'super_admin')
          OR public.is_organization_admin(auth.uid(), pad.organization_id)
        )
    )
  );

CREATE POLICY "Org admins can delete attribute values"
  ON public.product_attribute_values FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.product_attribute_definitions pad
      WHERE pad.id = product_attribute_values.attribute_definition_id
        AND (
          public.has_role(auth.uid(), 'super_admin')
          OR public.is_organization_admin(auth.uid(), pad.organization_id)
        )
    )
  );

-- 2) customer_accounts: allow admins/super admins to delete
CREATE POLICY "Org admins can delete customer accounts"
  ON public.customer_accounts FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.is_organization_admin(auth.uid(), organization_id)
  );

-- 3) organization_invitations: prevent public token enumeration by creating secure RPCs
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', oi.id,
    'email', oi.email,
    'role', oi.role,
    'expires_at', oi.expires_at,
    'used_at', oi.used_at,
    'organization', jsonb_build_object(
      'id', o.id,
      'name', o.name,
      'description', o.description
    )
  )
  INTO result
  FROM public.organization_invitations oi
  JOIN public.organizations o ON o.id = oi.organization_id
  WHERE oi.token = _token
  LIMIT 1;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_invitation(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv public.organization_invitations;
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_inv
  FROM public.organization_invitations
  WHERE token = _token
  LIMIT 1;

  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF v_inv.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invitation already used';
  END IF;

  IF v_inv.expires_at < now() THEN
    RAISE EXCEPTION 'Invitation expired';
  END IF;

  INSERT INTO public.user_organizations (user_id, organization_id, role)
  VALUES (v_user, v_inv.organization_id, v_inv.role)
  ON CONFLICT DO NOTHING;

  UPDATE public.organization_invitations
  SET used_at = now()
  WHERE id = v_inv.id;

  RETURN jsonb_build_object(
    'organization_id', v_inv.organization_id,
    'role', v_inv.role
  );
END;
$$;

-- 4) Fix mutable search_path on remaining functions
ALTER FUNCTION public.trigger_set_timestamp() SET search_path = public;
ALTER FUNCTION public.generate_product_sku(text, text, uuid) SET search_path = public;
ALTER FUNCTION public.generate_variant_sku(text, text, text, uuid) SET search_path = public;
ALTER FUNCTION public.get_organization_by_slug(text) SET search_path = public;
ALTER FUNCTION public.migrate_organization_categories(uuid) SET search_path = public;

-- 5) Revoke EXECUTE on SECURITY DEFINER functions from PUBLIC; grant selectively
-- Trigger-only functions (no external caller)
REVOKE ALL ON FUNCTION public.trigger_set_timestamp() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_role_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_product_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_organization_slug() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_slug(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_product_sku(text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_variant_sku(text, text, text, uuid) FROM PUBLIC, anon, authenticated;

-- Functions callable by anon (public routes)
REVOKE ALL ON FUNCTION public.get_organization_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_organization_by_slug(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_public_account_statement(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_account_statement(text, uuid) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_invitation_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(text) TO anon, authenticated;

-- Authenticated-only functions (RPCs + RLS helpers)
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_roles(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_roles(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.user_belongs_to_org(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_belongs_to_org(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_organization_admin(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_organization_admin(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_default_organization(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_default_organization(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_transaction(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_transaction(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.update_transaction(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_transaction(uuid, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.clean_duplicate_products(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.clean_duplicate_products(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.detect_duplicate_products(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.detect_duplicate_products(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.generate_invitation_token() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_invitation_token() TO authenticated;

REVOKE ALL ON FUNCTION public.get_users_with_roles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;

REVOKE ALL ON FUNCTION public.migrate_organization_categories(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.migrate_organization_categories(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.calculate_fifo_cost(uuid, uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_fifo_cost(uuid, uuid, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.update_batches_after_sale(uuid, uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_batches_after_sale(uuid, uuid, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.get_product_total_stock(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_product_total_stock(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.update_variant_batches_after_sale(uuid, uuid, uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_variant_batches_after_sale(uuid, uuid, uuid, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.accept_invitation(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;

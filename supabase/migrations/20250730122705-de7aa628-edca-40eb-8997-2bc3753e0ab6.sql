-- Fix RLS policies to avoid circular dependency
-- Drop the problematic policy that includes SELECT operations
DROP POLICY IF EXISTS "Organization admins can manage their org memberships" ON public.user_organizations;

-- Create separate policies for non-SELECT operations only
-- This avoids circular dependency since SELECT is handled by the simple user_id policy
CREATE POLICY "Organization admins can insert org memberships" 
ON public.user_organizations 
FOR INSERT
WITH CHECK (public.is_organization_admin(auth.uid(), organization_id));

CREATE POLICY "Organization admins can update org memberships" 
ON public.user_organizations 
FOR UPDATE
USING (public.is_organization_admin(auth.uid(), organization_id));

CREATE POLICY "Organization admins can delete org memberships" 
ON public.user_organizations 
FOR DELETE
USING (public.is_organization_admin(auth.uid(), organization_id));
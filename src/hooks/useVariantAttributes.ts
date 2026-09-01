import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type VariantAttributeDef = {
  id: string;
  organization_id: string;
  name: string;
  key: string;
  data_type: string;
  options: any | null;
  position: number;
  created_at?: string;
  updated_at?: string;
};

const variantAttributesKey = (orgId: string) => ['variant-attribute-definitions', orgId] as const;

export function useVariantAttributes(organizationId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: variantAttributesKey(organizationId || 'none'),
    queryFn: async (): Promise<VariantAttributeDef[]> => {
      if (!organizationId) return [];

      const { data, error } = await (supabase as any)
        .from('variant_attribute_definitions')
        .select('*')
        .eq('organization_id', organizationId)
        .order('position', { ascending: true });

      if (error) throw error;
      return (data as VariantAttributeDef[]) || [];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });

  const attributes = query.data ?? [];

  const load = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: variantAttributesKey(organizationId || 'none') });
  }, [queryClient, organizationId]);

  const add = useCallback(
    async (payload: Partial<VariantAttributeDef>) => {
      if (!organizationId) return null;
      const row = {
        organization_id: organizationId,
        name: payload.name || '',
        key: payload.key || '',
        data_type: payload.data_type || 'string',
        options: payload.options || null,
        position: payload.position || 0,
      };
      const { data, error } = await (supabase as any)
        .from('variant_attribute_definitions')
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      await load();
      return data as VariantAttributeDef;
    },
    [organizationId, load]
  );

  const update = useCallback(
    async (id: string, payload: Partial<VariantAttributeDef>) => {
      const { data, error } = await (supabase as any)
        .from('variant_attribute_definitions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await load();
      return data as VariantAttributeDef;
    },
    [load]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await (supabase as any)
        .from('variant_attribute_definitions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await load();
      return true;
    },
    [load]
  );

  return { attributes, loading: query.isLoading && !query.data, load, add, update, remove };
}
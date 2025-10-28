import { useCallback, useEffect, useState } from 'react';
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

export function useVariantAttributes(organizationId?: string) {
  const [attributes, setAttributes] = useState<VariantAttributeDef[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!organizationId) {
      setAttributes([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('variant_attribute_definitions')
        .select('*')
        .eq('organization_id', organizationId)
        .order('position', { ascending: true });

      if (error) throw error;
      setAttributes((data as any) || []);
    } catch (err) {
      console.error('load variant attributes error', err);
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

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
      const { data, error } = await supabase
        .from('variant_attribute_definitions')
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      // refresh
      await load();
      return data as VariantAttributeDef;
    },
    [organizationId, load]
  );

  const update = useCallback(
    async (id: string, payload: Partial<VariantAttributeDef>) => {
      const { data, error } = await supabase
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
      const { error } = await supabase
        .from('variant_attribute_definitions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await load();
      return true;
    },
    [load]
  );

  return { attributes, loading, load, add, update, remove };
}

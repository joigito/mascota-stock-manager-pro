import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';

export interface PriceHistory {
  id: string;
  product_id: string;
  organization_id: string;
  old_cost_price?: number;
  new_cost_price?: number;
  old_selling_price?: number;
  new_selling_price?: number;
  changed_by: string;
  reason: string;
  created_at: string;
}

const priceHistoryKey = (orgId: string, productId?: string) =>
  ['price-history', orgId, productId ?? 'all'] as const;

export const usePriceHistory = () => {
  const [activeProductId, setActiveProductId] = useState<string | undefined>(undefined);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const orgId = currentOrganization?.id;

  const query = useQuery({
    queryKey: priceHistoryKey(orgId || 'none', activeProductId),
    queryFn: async (): Promise<PriceHistory[]> => {
      if (!user || !orgId || !activeProductId) return [];

      let q = supabase
        .from('price_history')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .eq('product_id', activeProductId);

      const { data, error } = await q;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!orgId && !!activeProductId,
    staleTime: 5 * 60 * 1000,
  });

  const priceHistory = query.data ?? [];

  const loadPriceHistory = async (productId?: string) => {
    setActiveProductId(productId);
  };

  const recordPriceChange = async (
    productId: string,
    oldCostPrice?: number,
    newCostPrice?: number,
    oldSellingPrice?: number,
    newSellingPrice?: number,
    reason: string = 'Manual update'
  ) => {
    if (!user || !orgId) {
      console.error('Usuario no autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('price_history')
        .insert({
          product_id: productId,
          organization_id: orgId,
          old_cost_price: oldCostPrice,
          new_cost_price: newCostPrice,
          old_selling_price: oldSellingPrice,
          new_selling_price: newSellingPrice,
          changed_by: user.id,
          reason
        })
        .select()
        .single();

      if (error) throw error;

      if (activeProductId === productId) {
        queryClient.setQueryData<PriceHistory[]>(priceHistoryKey(orgId, activeProductId), (prev) => [data, ...(prev ?? [])]);
      }
      return true;
    } catch (error) {
      console.error('Error recording price change:', error);
      return false;
    }
  };

  return {
    priceHistory,
    loading: query.isLoading && !query.data,
    loadPriceHistory,
    recordPriceChange
  };
};
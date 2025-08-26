import { useState, useEffect } from 'react';
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

export const usePriceHistory = () => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  const loadPriceHistory = async (productId?: string) => {
    if (!user || !currentOrganization) return;

    setLoading(true);
    try {
      let query = supabase
        .from('price_history')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPriceHistory(data || []);
    } catch (error) {
      console.error('Error loading price history:', error);
      toast.error('Error al cargar el historial de precios');
    } finally {
      setLoading(false);
    }
  };

  const recordPriceChange = async (
    productId: string,
    oldCostPrice?: number,
    newCostPrice?: number,
    oldSellingPrice?: number,
    newSellingPrice?: number,
    reason: string = 'Manual update'
  ) => {
    if (!user || !currentOrganization) {
      console.error('Usuario no autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('price_history')
        .insert({
          product_id: productId,
          organization_id: currentOrganization.id,
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

      setPriceHistory(prev => [data, ...prev]);
      return true;
    } catch (error) {
      console.error('Error recording price change:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user && currentOrganization) {
      loadPriceHistory();
    }
  }, [user, currentOrganization]);

  return {
    priceHistory,
    loading,
    loadPriceHistory,
    recordPriceChange
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { toast } from 'sonner';

export interface ProductBatch {
  id: string;
  product_id: string;
  organization_id: string;
  purchase_price: number;
  quantity_purchased: number;
  quantity_remaining: number;
  batch_date: string;
  supplier?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useBatches = () => {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  const loadBatches = async (productId?: string) => {
    if (!user || !currentOrganization) return;

    setLoading(true);
    try {
      let query = supabase
        .from('product_batches')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('batch_date', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBatches(data || []);
    } catch (error) {
      console.error('Error loading batches:', error);
      toast.error('Error al cargar los lotes');
    } finally {
      setLoading(false);
    }
  };

  const addBatch = async (batchData: Omit<ProductBatch, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'organization_id'>) => {
    if (!user || !currentOrganization) {
      toast.error('Usuario no autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('product_batches')
        .insert({
          ...batchData,
          organization_id: currentOrganization.id,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setBatches(prev => [data, ...prev]);
      toast.success('Lote agregado correctamente');
      return true;
    } catch (error) {
      console.error('Error adding batch:', error);
      toast.error('Error al agregar el lote');
      return false;
    }
  };

  const updateBatch = async (id: string, updates: Partial<ProductBatch>) => {
    if (!user || !currentOrganization) {
      toast.error('Usuario no autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('product_batches')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', currentOrganization.id)
        .select()
        .single();

      if (error) throw error;

      setBatches(prev => prev.map(batch => batch.id === id ? data : batch));
      toast.success('Lote actualizado correctamente');
      return true;
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('Error al actualizar el lote');
      return false;
    }
  };

  const deleteBatch = async (id: string) => {
    if (!user || !currentOrganization) {
      toast.error('Usuario no autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('product_batches')
        .delete()
        .eq('id', id)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      setBatches(prev => prev.filter(batch => batch.id !== id));
      toast.success('Lote eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Error al eliminar el lote');
      return false;
    }
  };

  const calculateFifoCost = async (productId: string, quantity: number): Promise<number> => {
    if (!currentOrganization) return 0;

    try {
      const { data, error } = await supabase
        .rpc('calculate_fifo_cost', {
          p_product_id: productId,
          p_organization_id: currentOrganization.id,
          p_quantity: quantity
        });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error calculating FIFO cost:', error);
      return 0;
    }
  };

  const updateBatchesAfterSale = async (productId: string, quantity: number): Promise<boolean> => {
    if (!currentOrganization) return false;

    try {
      const { error } = await supabase
        .rpc('update_batches_after_sale', {
          p_product_id: productId,
          p_organization_id: currentOrganization.id,
          p_quantity: quantity
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating batches after sale:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user && currentOrganization) {
      loadBatches();
    }
  }, [user, currentOrganization]);

  return {
    batches,
    loading,
    loadBatches,
    addBatch,
    updateBatch,
    deleteBatch,
    calculateFifoCost,
    updateBatchesAfterSale
  };
};
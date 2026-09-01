import { useQuery, useQueryClient } from '@tanstack/react-query';
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

const batchesKey = (orgId: string, productId?: string) =>
  ['batches', orgId, productId ?? 'all'] as const;

const fetchBatches = async (
  user: { id: string } | null | undefined,
  orgId: string | undefined,
  productId?: string
): Promise<ProductBatch[]> => {
  if (!user || !orgId) return [];

  let query = supabase
    .from('product_batches')
    .select('*')
    .eq('organization_id', orgId)
    .order('batch_date', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const useBatches = () => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const orgId = currentOrganization?.id;
  const key = batchesKey(orgId || 'none', 'all');

  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchBatches(user, orgId),
    enabled: !!user && !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const batches = query.data ?? [];

  const loadBatches = async (productId?: string) => {
    const targetKey = batchesKey(orgId || 'none', productId);
    await queryClient.fetchQuery({
      queryKey: targetKey,
      queryFn: () => fetchBatches(user, orgId, productId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const addBatch = async (batchData: Omit<ProductBatch, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'organization_id'>) => {
    if (!user || !orgId) {
      toast.error('Usuario no autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('product_batches')
        .insert({
          ...batchData,
          organization_id: orgId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.setQueryData<ProductBatch[]>(batchesKey(orgId, 'all'), (prev) => [data, ...(prev ?? [])]);
      queryClient.setQueryData<ProductBatch[]>(batchesKey(orgId, batchData.product_id), (prev) => [data, ...(prev ?? [])]);
      toast.success('Lote agregado correctamente');
      return true;
    } catch (error) {
      console.error('Error adding batch:', error);
      toast.error('Error al agregar el lote');
      return false;
    }
  };

  const updateBatch = async (id: string, updates: Partial<ProductBatch>) => {
    if (!user || !orgId) {
      toast.error('Usuario no autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('product_batches')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single();

      if (error) throw error;

      queryClient.setQueryData<ProductBatch[]>(batchesKey(orgId, 'all'), (prev) =>
        (prev ?? []).map(batch => batch.id === id ? data : batch)
      );
      return true;
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error('Error al actualizar el lote');
      return false;
    }
  };

  const deleteBatch = async (id: string) => {
    if (!user || !orgId) {
      toast.error('Usuario no autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('product_batches')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) throw error;

      queryClient.setQueryData<ProductBatch[]>(batchesKey(orgId, 'all'), (prev) =>
        (prev ?? []).filter(batch => batch.id !== id)
      );
      toast.success('Lote eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Error al eliminar el lote');
      return false;
    }
  };

  const calculateFifoCost = async (productId: string, quantity: number): Promise<number> => {
    if (!orgId) return 0;

    try {
      const { data, error } = await supabase
        .rpc('calculate_fifo_cost', {
          p_product_id: productId,
          p_organization_id: orgId,
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
    if (!orgId) return false;

    try {
      const { error } = await supabase
        .rpc('update_batches_after_sale', {
          p_product_id: productId,
          p_organization_id: orgId,
          p_quantity: quantity
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating batches after sale:', error);
      return false;
    }
  };

  return {
    batches,
    loading: query.isLoading && !query.data,
    loadBatches,
    addBatch,
    updateBatch,
    deleteBatch,
    calculateFifoCost,
    updateBatchesAfterSale
  };
};
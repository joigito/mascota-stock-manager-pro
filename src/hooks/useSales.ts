import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from './useOrganization';
import { Sale, SaleItem } from '@/types/sales';

const salesKey = (orgId: string) => ['sales', orgId] as const;

export const useSales = () => {
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const orgId = currentOrganization?.id;

  const loadSales = async (): Promise<Sale[]> => {
    if (!user || !orgId) {
      return [];
    }

    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`*, sale_items (*)`)
      .eq('organization_id', orgId)
      .order('date', { ascending: false });

    if (salesError) throw salesError;

    return Promise.all(salesData.map(async sale => {
      const items = await Promise.all(sale.sale_items.map(async (item: any): Promise<SaleItem> => {
        let variantInfo = '';

        if (item.variant_id) {
          const { data: variantData } = await supabase
            .from('product_variants')
            .select('size, color, attributes')
            .eq('id', item.variant_id)
            .single();

          if (variantData) {
            const parts = [];
            if (variantData.size) parts.push(variantData.size);
            if (variantData.color) parts.push(variantData.color);
            if (variantData.attributes) {
              const attrs = variantData.attributes as Record<string, string>;
              Object.entries(attrs).forEach(([key, value]) => {
                if (value) parts.push(`${key}: ${value}`);
              });
            }
            variantInfo = parts.join(', ');
          }
        }

        return {
          productId: item.product_id,
          productName: item.product_name,
          variantId: item.variant_id,
          variantInfo,
          quantity: item.quantity,
          price: Number(item.price),
          finalUnitPrice: Number(item.final_unit_price),
          costPrice: Number(item.cost_price || 0),
          subtotal: Number(item.subtotal),
          profit: Number(item.profit || 0),
          margin: Number(item.margin || 0)
        };
      }));

      return {
        id: sale.id,
        date: sale.date,
        customer: sale.customer || 'Consumidor final',
        total: Number(sale.total),
        totalProfit: Number(sale.total_profit || 0),
        averageMargin: Number(sale.average_margin || 0),
        items
      };
    }));
  };

  const query = useQuery({
    queryKey: salesKey(orgId || 'none'),
    queryFn: loadSales,
    enabled: !!user && !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const sales = query.data ?? [];

  const addSale = async (saleData: Omit<Sale, 'id'>) => {
    if (!user || !orgId) {
      return { error: new Error('Usuario no autenticado o organización no seleccionada') };
    }

    try {
      const { data: newSale, error: saleError } = await supabase
        .from('sales')
        .insert({
          date: saleData.date,
          customer: saleData.customer,
          total: saleData.total,
          total_profit: saleData.totalProfit,
          average_margin: saleData.averageMargin,
          user_id: user.id,
          organization_id: orgId
        })
        .select()
        .single();

      if (saleError) throw saleError;

      if (saleData.items && saleData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(
            saleData.items.map(item => ({
              sale_id: newSale.id,
              product_id: item.productId || null,
              variant_id: item.variantId,
              product_name: item.productName,
              quantity: item.quantity,
              price: item.price,
              final_unit_price: item.finalUnitPrice,
              cost_price: item.costPrice || 0,
              subtotal: item.subtotal,
              profit: item.profit || 0,
              margin: item.margin || 0
            }))
          );

        if (itemsError) throw itemsError;
      }

      const completeSale: Sale = {
        id: newSale.id,
        ...saleData
      };

      queryClient.setQueryData<Sale[]>(salesKey(orgId), (prev) => [completeSale, ...(prev ?? [])]);
      return { error: null, saleId: newSale.id };
    } catch (error) {
      console.error('Error agregando venta:', error);
      return { error };
    }
  };

  const deleteSale = async (saleId: string) => {
    if (!user || !orgId) {
      return { error: new Error('Usuario no autenticado o organización no seleccionada') };
    }

    try {
      const { error: deleteError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId)
        .eq('organization_id', orgId);

      if (deleteError) throw deleteError;

      queryClient.setQueryData<Sale[]>(salesKey(orgId), (prev) =>
        (prev ?? []).filter(sale => sale.id !== saleId)
      );
      return { error: null };
    } catch (error) {
      console.error('Error eliminando venta:', error);
      return { error };
    }
  };

  const syncSales = async () => {
    setSyncing(true);
    try {
      await queryClient.refetchQueries({ queryKey: salesKey(orgId || 'none') });
      toast({ title: "Sincronización completada", description: "Ventas actualizadas" });
    } finally {
      setSyncing(false);
    }
  };

  return {
    sales,
    loading: query.isLoading && !query.data,
    syncing,
    addSale,
    deleteSale,
    syncSales
  };
};
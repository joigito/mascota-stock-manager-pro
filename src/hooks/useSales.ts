import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from './useOrganization';
import { Sale } from '@/types/sales';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();

  // Migrar datos de localStorage a Supabase
  const migrateLocalStorageData = async () => {
    if (!user || !currentOrganization) return;

    const savedSales = localStorage.getItem('sales');
    if (!savedSales) return;

    try {
      const localSales = JSON.parse(savedSales);
      console.log('Migrando ventas de localStorage a Supabase:', localSales.length);
      
      for (const sale of localSales) {
        // Insertar la venta
        const { data: saleData, error: saleError } = await supabase
          .from('sales')
          .insert({
            date: sale.date,
            customer: sale.customer,
            total: sale.total,
            total_profit: sale.totalProfit,
            average_margin: sale.averageMargin,
            user_id: user.id,
            organization_id: currentOrganization.id
          })
          .select()
          .single();

        if (saleError) {
          console.error('Error migrando venta:', saleError);
          continue;
        }

        // Insertar los items de la venta
        if (sale.items && sale.items.length > 0) {
          for (const item of sale.items) {
            const { error: itemError } = await supabase
              .from('sale_items')
              .insert({
                sale_id: saleData.id,
                product_id: item.productId,
                product_name: item.productName,
                quantity: item.quantity,
                price: item.price,
                cost_price: item.costPrice || 0,
                subtotal: item.subtotal,
                profit: item.profit || 0,
                margin: item.margin || 0
              });
            
            if (itemError) {
              console.error('Error migrando item de venta:', itemError);
            }
          }
        }
      }
      
      localStorage.removeItem('sales');
      toast({
        title: "Migración completada",
        description: "Ventas migradas a la base de datos",
      });
    } catch (error) {
      console.error('Error durante la migración de ventas:', error);
    }
  };

  // Cargar ventas desde Supabase
  const loadSales = async () => {
    if (!user || !currentOrganization) {
      setLoading(false);
      return;
    }

    try {
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (*)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('date', { ascending: false });

      if (salesError) throw salesError;

      const formattedSales: Sale[] = salesData.map(sale => ({
        id: sale.id,
        date: sale.date,
        customer: sale.customer || 'Cliente General',
        total: Number(sale.total),
        totalProfit: Number(sale.total_profit || 0),
        averageMargin: Number(sale.average_margin || 0),
        items: sale.sale_items.map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          price: Number(item.price),
          costPrice: Number(item.cost_price || 0),
          subtotal: Number(item.subtotal),
          profit: Number(item.profit || 0),
          margin: Number(item.margin || 0)
        }))
      }));

      setSales(formattedSales);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar manualmente
  const syncSales = async () => {
    setSyncing(true);
    await loadSales();
    setSyncing(false);
    toast({
      title: "Sincronización completada",
      description: "Ventas actualizadas desde la base de datos",
    });
  };

  useEffect(() => {
    console.log('useSales: Effect triggered with:', { user: user?.id, currentOrganization: currentOrganization?.id });
    
    if (user && currentOrganization) {
      console.log('useSales: Starting data loading...');
      migrateLocalStorageData()
        .then(() => loadSales())
        .catch(error => {
          console.error('useSales: Error in data loading:', error);
          setLoading(false);
        });
    } else {
      console.log('useSales: Missing dependencies - user or organization not ready');
      setLoading(false);
    }
  }, [user, currentOrganization]);

  const addSale = async (saleData: Omit<Sale, 'id'>) => {
    if (!user || !currentOrganization) {
      return { error: new Error('Usuario no autenticado o organización no seleccionada') };
    }

    try {
      // Insertar la venta
      const { data: newSale, error: saleError } = await supabase
        .from('sales')
        .insert({
          date: saleData.date,
          customer: saleData.customer,
          total: saleData.total,
          total_profit: saleData.totalProfit,
          average_margin: saleData.averageMargin,
          user_id: user.id,
          organization_id: currentOrganization.id
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insertar los items de la venta
      if (saleData.items && saleData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(
            saleData.items.map(item => ({
              sale_id: newSale.id,
              product_id: item.productId,
              product_name: item.productName,
              quantity: item.quantity,
              price: item.price,
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
        date: newSale.date,
        customer: newSale.customer || 'Cliente General',
        total: Number(newSale.total),
        totalProfit: Number(newSale.total_profit || 0),
        averageMargin: Number(newSale.average_margin || 0),
        items: saleData.items || []
      };

      setSales(prev => [completeSale, ...prev]);
      return { error: null };
    } catch (error) {
      console.error('Error agregando venta:', error);
      return { error };
    }
  };

  return {
    sales,
    loading,
    syncing,
    addSale,
    syncSales
  };
};
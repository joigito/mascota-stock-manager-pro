
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Sale } from '@/types/sales';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Migrar datos de localStorage a Supabase
  const migrateLocalStorageData = async () => {
    if (!user) return;

    const savedSales = localStorage.getItem('sales');
    if (savedSales) {
      try {
        const localSales = JSON.parse(savedSales);
        console.log('Migrando ventas de localStorage a Supabase:', localSales.length);
        
        for (const sale of localSales) {
          // Insertar venta
          const { data: saleData, error: saleError } = await supabase
            .from('sales')
            .insert({
              date: sale.date,
              customer: sale.customer || 'Cliente General',
              total: sale.total,
              total_profit: sale.totalProfit || 0,
              average_margin: sale.averageMargin || 0,
              user_id: user.id
            })
            .select()
            .single();

          if (saleError && !saleError.message.includes('duplicate key')) {
            console.error('Error migrando venta:', saleError);
            continue;
          }

          // Insertar items de la venta
          if (saleData && sale.items) {
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

              if (itemError && !itemError.message.includes('duplicate key')) {
                console.error('Error migrando item de venta:', itemError);
              }
            }
          }
        }
        
        // Limpiar localStorage después de migrar
        localStorage.removeItem('sales');
        toast({
          title: "Migración completada",
          description: "Ventas migradas a la base de datos",
        });
      } catch (error) {
        console.error('Error durante la migración de ventas:', error);
      }
    }
  };

  // Cargar ventas desde Supabase
  const loadSales = async () => {
    if (!user) {
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
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (salesError) throw salesError;

      const formattedSales: Sale[] = salesData.map(sale => ({
        id: sale.id,
        date: sale.date,
        customer: sale.customer,
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

  // Agregar nueva venta
  const addSale = async (saleData: Omit<Sale, 'id'>) => {
    if (!user) {
      return { error: new Error('Usuario no autenticado') };
    }

    try {
      // Insertar venta
      const { data: newSaleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          date: saleData.date,
          customer: saleData.customer,
          total: saleData.total,
          total_profit: saleData.totalProfit || 0,
          average_margin: saleData.averageMargin || 0,
          user_id: user.id
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insertar items de la venta
      if (saleData.items && saleData.items.length > 0) {
        const saleItemsData = saleData.items.map(item => ({
          sale_id: newSaleData.id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
          cost_price: item.costPrice || 0,
          subtotal: item.subtotal,
          profit: item.profit || 0,
          margin: item.margin || 0
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItemsData);

        if (itemsError) throw itemsError;
      }

      // Actualizar estado local
      const newSale: Sale = {
        id: newSaleData.id,
        date: newSaleData.date,
        customer: newSaleData.customer,
        total: Number(newSaleData.total),
        totalProfit: Number(newSaleData.total_profit || 0),
        averageMargin: Number(newSaleData.average_margin || 0),
        items: saleData.items
      };

      setSales(prev => [newSale, ...prev]);
      return { error: null };
    } catch (error) {
      console.error('Error agregando venta:', error);
      return { error };
    }
  };

  useEffect(() => {
    if (user) {
      migrateLocalStorageData().then(() => {
        loadSales();
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    sales,
    loading,
    syncing,
    addSale,
    syncSales
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Product {
  id: string;
  name: string;
  category: 'mascotas' | 'forrajeria';
  stock: number;
  minStock: number;
  price: number;
  costPrice: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Migrar datos de localStorage a Supabase
  const migrateLocalStorageData = async () => {
    if (!user) return;

    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        const localProducts = JSON.parse(savedProducts);
        console.log('Migrando productos de localStorage a Supabase:', localProducts.length);
        
        for (const product of localProducts) {
          const { error } = await supabase
            .from('products')
            .insert({
              name: product.name,
              category: product.category,
              stock: product.stock,
              min_stock: product.minStock,
              price: product.price,
              cost_price: product.costPrice || (product.price * 0.7),
              description: product.description,
              user_id: user.id
            });
          
          if (error && !error.message.includes('duplicate key')) {
            console.error('Error migrando producto:', error);
          }
        }
        
        // Limpiar localStorage después de migrar
        localStorage.removeItem('products');
        toast({
          title: "Migración completada",
          description: "Productos migrados a la base de datos",
        });
      } catch (error) {
        console.error('Error durante la migración:', error);
      }
    }
  };

  // Cargar productos desde Supabase
  const loadProducts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category as 'mascotas' | 'forrajeria',
        stock: product.stock,
        minStock: product.min_stock,
        price: Number(product.price),
        costPrice: Number(product.cost_price || 0),
        description: product.description,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar manualmente
  const syncProducts = async () => {
    setSyncing(true);
    await loadProducts();
    setSyncing(false);
    toast({
      title: "Sincronización completada",
      description: "Productos actualizados desde la base de datos",
    });
  };

  useEffect(() => {
    if (user) {
      migrateLocalStorageData().then(() => {
        loadProducts();
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      return { error: new Error('Usuario no autenticado') };
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          category: productData.category,
          stock: productData.stock,
          min_stock: productData.minStock,
          price: productData.price,
          cost_price: productData.costPrice,
          description: productData.description,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        category: data.category as 'mascotas' | 'forrajeria',
        stock: data.stock,
        minStock: data.min_stock,
        price: Number(data.price),
        costPrice: Number(data.cost_price),
        description: data.description,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProducts(prev => [newProduct, ...prev]);
      return { error: null };
    } catch (error) {
      console.error('Error agregando producto:', error);
      return { error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user) {
      return { error: new Error('Usuario no autenticado') };
    }

    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.minStock !== undefined) updateData.min_stock = updates.minStock;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.costPrice !== undefined) updateData.cost_price = updates.costPrice;
      if (updates.description !== undefined) updateData.description = updates.description;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProducts(prev => 
        prev.map(product => 
          product.id === id 
            ? { ...product, ...updates, updated_at: new Date().toISOString() }
            : product
        )
      );
      return { error: null };
    } catch (error) {
      console.error('Error actualizando producto:', error);
      return { error };
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) {
      return { error: new Error('Usuario no autenticado') };
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error eliminando producto:', error);
      return { error };
    }
  };

  return {
    products,
    loading,
    syncing,
    addProduct,
    updateProduct,
    deleteProduct,
    syncProducts
  };
};

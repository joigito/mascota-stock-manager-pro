import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from './useOrganization';
import type { Database } from '@/integrations/supabase/types';

export interface Product {
  id: string;
  name: string;
  category: Database['public']['Enums']['product_category'];
  stock: number;
  minStock: number;
  price: number;
  costPrice: number;
  description?: string;
  organization_id: string;
  created_at?: string;
  updated_at?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();

  // Verificar si ya existen productos para esta organización
  const checkExistingProducts = async () => {
    if (!user || !currentOrganization) return false;
    
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('organization_id', currentOrganization.id)
      .limit(1);
    
    return !error && data && data.length > 0;
  };

  // Migrar datos de localStorage a Supabase (mejorado para evitar duplicados)
  const migrateLocalStorageData = async () => {
    if (!user || !currentOrganization) return;

    const savedProducts = localStorage.getItem('products');
    if (!savedProducts) return;

    try {
      // Verificar si ya hay productos en la base de datos
      const hasExistingProducts = await checkExistingProducts();
      if (hasExistingProducts) {
        console.log('Ya existen productos en la base de datos, saltando migración');
        localStorage.removeItem('products');
        return;
      }

      const localProducts = JSON.parse(savedProducts);
      console.log('Migrando productos de localStorage a Supabase:', localProducts.length);
      
      // Migrar productos uno por uno con manejo de duplicados
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
            user_id: user.id,
            organization_id: currentOrganization.id
          });
        
        if (error && !error.message.includes('duplicate key')) {
          console.error('Error migrando producto:', error);
        }
      }
      
      // Limpiar localStorage después de migrar exitosamente
      localStorage.removeItem('products');
      toast({
        title: "Migración completada",
        description: "Productos migrados a la base de datos",
      });
    } catch (error) {
      console.error('Error durante la migración:', error);
    }
  };

  // Detectar productos duplicados
  const detectDuplicates = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .rpc('detect_duplicate_products', { user_uuid: user.id });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error detectando duplicados:', error);
      return [];
    }
  };

  // Limpiar productos duplicados
  const cleanDuplicates = async () => {
    if (!user) return;

    try {
      setSyncing(true);
      const { data, error } = await supabase
        .rpc('clean_duplicate_products', { user_uuid: user.id });

      if (error) throw error;

      const deletedCount = data?.[0]?.deleted_count || 0;
      
      if (deletedCount > 0) {
        toast({
          title: "Duplicados eliminados",
          description: `Se eliminaron ${deletedCount} productos duplicados`,
        });
        await loadProducts(); // Recargar la lista
      } else {
        toast({
          title: "Sin duplicados",
          description: "No se encontraron productos duplicados",
        });
      }
    } catch (error) {
      console.error('Error limpiando duplicados:', error);
      toast({
        title: "Error",
        description: "No se pudieron limpiar los duplicados",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Cargar productos desde Supabase
  const loadProducts = async () => {
    if (!user || !currentOrganization) {
      console.log('useProducts: loadProducts called without user or organization');
      setLoading(false);
      return;
    }

    try {
      console.log('useProducts: Loading products for organization:', currentOrganization.id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('useProducts: Loaded products count:', data?.length || 0);

      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        stock: product.stock,
        minStock: product.min_stock,
        price: Number(product.price),
        costPrice: Number(product.cost_price || 0),
        description: product.description,
        organization_id: product.organization_id,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));

      setProducts(formattedProducts);
      console.log('useProducts: Products set successfully');
    } catch (error) {
      console.error('useProducts: Error loading products:', error);
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
    console.log('useProducts: Effect triggered with:', { user: user?.id, currentOrganization: currentOrganization?.id });
    
    if (user && currentOrganization) {
      console.log('useProducts: Starting data loading...');
      migrateLocalStorageData()
        .then(() => loadProducts())
        .catch(error => {
          console.error('useProducts: Error in data loading:', error);
          setLoading(false);
        });
    } else {
      console.log('useProducts: Missing dependencies - user or organization not ready');
      setLoading(false);
    }
  }, [user, currentOrganization]);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
    console.log('addProduct: Starting with data:', productData);
    console.log('addProduct: User:', user?.id);
    console.log('addProduct: Current organization:', currentOrganization?.id, currentOrganization?.name);
    
    if (!user || !currentOrganization) {
      console.error('addProduct: Missing user or organization');
      return { error: new Error('Usuario no autenticado o organización no seleccionada') };
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
          user_id: user.id,
          organization_id: currentOrganization.id
        })
        .select()
        .single();

      if (error) {
        // Manejar error de duplicado de manera más amigable
        if (error.message.includes('unique_product_per_user_org')) {
          return { error: new Error('Ya existe un producto con este nombre en la misma categoría en esta organización') };
        }
        throw error;
      }

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        category: data.category,
        stock: data.stock,
        minStock: data.min_stock,
        price: Number(data.price),
        costPrice: Number(data.cost_price),
        description: data.description,
        organization_id: data.organization_id,
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
        .eq('id', id);

      if (error) {
        if (error.message.includes('unique_product_per_user_org')) {
          return { error: new Error('Ya existe un producto con este nombre en la misma categoría en esta organización') };
        }
        throw error;
      }

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
        .eq('id', id);

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
    syncProducts,
    cleanDuplicates,
    detectDuplicates
  };
};
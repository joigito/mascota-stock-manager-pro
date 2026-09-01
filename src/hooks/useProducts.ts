import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from './useOrganization';
import type { Database } from '@/integrations/supabase/types';

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  costPrice: number;
  description?: string;
  organization_id: string;
  hasVariants?: boolean;
  baseSku?: string;
  created_at?: string;
  updated_at?: string;
}

const productsKey = (orgId: string) => ['products', orgId] as const;

export const useProducts = () => {
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const orgId = currentOrganization?.id;

  const loadProducts = async (): Promise<Product[]> => {
    if (!user || !orgId) {
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      stock: product.stock,
      minStock: product.min_stock,
      price: Number(product.price),
      costPrice: Number(product.cost_price || 0),
      description: product.description,
      organization_id: product.organization_id,
      hasVariants: product.has_variants || false,
      baseSku: product.base_sku,
      created_at: product.created_at,
      updated_at: product.updated_at,
    }));
  };

  const query = useQuery({
    queryKey: productsKey(orgId || 'none'),
    queryFn: loadProducts,
    enabled: !!user && !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const products = query.data ?? [];

  // Verificar si ya existen productos para esta organización
  const checkExistingProducts = async () => {
    if (!user || !orgId) return false;

    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('organization_id', orgId)
      .limit(1);

    return !error && data && data.length > 0;
  };

  // Migrar datos de localStorage a Supabase (mejorado para evitar duplicados)
  const migrateLocalStorageData = async () => {
    if (!user || !orgId) return;

    const savedProducts = localStorage.getItem('products');
    if (!savedProducts) return;

    try {
      const hasExistingProducts = await checkExistingProducts();
      if (hasExistingProducts) {
        localStorage.removeItem('products');
        return;
      }

      const localProducts = JSON.parse(savedProducts);

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
            organization_id: orgId
          });

        if (error && !error.message.includes('duplicate key')) {
          console.error('Error migrando producto:', error);
        }
      }

      localStorage.removeItem('products');
      toast({
        title: "Migración completada",
        description: "Productos migrados a la base de datos",
      });
      queryClient.invalidateQueries({ queryKey: productsKey(orgId) });
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
        await queryClient.invalidateQueries({ queryKey: productsKey(orgId || 'none') });
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

  // Sincronizar manualmente
  const syncProducts = async () => {
    setSyncing(true);
    try {
      await queryClient.refetchQueries({ queryKey: productsKey(orgId || 'none') });
      toast({
        title: "Sincronización completada",
        description: "Productos actualizados desde la base de datos",
      });
    } finally {
      setSyncing(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
    if (!user || !orgId) {
      return { error: new Error('Usuario no autenticado o organización no seleccionada') };
    }

    try {
      const insertData = {
        name: productData.name,
        category: productData.category,
        stock: productData.stock,
        min_stock: productData.minStock,
        price: productData.price,
        cost_price: productData.costPrice,
        description: productData.description,
        has_variants: productData.hasVariants || false,
        base_sku: productData.baseSku,
        user_id: user.id,
        organization_id: orgId
      };

      const { data, error } = await supabase
        .from('products')
        .insert(insertData)
        .select()
        .single();

      if (error) {
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
        hasVariants: data.has_variants || false,
        baseSku: data.base_sku,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      queryClient.setQueryData<Product[]>(productsKey(orgId), (prev) => [newProduct, ...(prev ?? [])]);
      return { error: null };
    } catch (error) {
      console.error('Error agregando producto:', error);
      return { error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user || !orgId) {
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
      if (updates.hasVariants !== undefined) updateData.has_variants = updates.hasVariants;
      if (updates.baseSku !== undefined) updateData.base_sku = updates.baseSku;

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

      queryClient.setQueryData<Product[]>(productsKey(orgId), (prev) =>
        (prev ?? []).map(product =>
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
    if (!user || !orgId) {
      return { error: new Error('Usuario no autenticado') };
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.setQueryData<Product[]>(productsKey(orgId), (prev) =>
        (prev ?? []).filter(product => product.id !== id)
      );
      return { error: null };
    } catch (error) {
      console.error('Error eliminando producto:', error);
      return { error };
    }
  };

  return {
    products,
    loading: query.isLoading && !query.data,
    syncing,
    addProduct,
    updateProduct,
    deleteProduct,
    syncProducts,
    cleanDuplicates,
    detectDuplicates
  };
};
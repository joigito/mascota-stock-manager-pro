
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  category: "mascotas" | "forrajeria";
  stock: number;
  minStock: number;
  price: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProducts = async () => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        });
        return;
      }

      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category as "mascotas" | "forrajeria",
        stock: product.stock,
        minStock: product.min_stock,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        description: product.description || undefined,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, "id">) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: product.name,
          category: product.category,
          stock: product.stock,
          min_stock: product.minStock,
          price: product.price,
          description: product.description || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        toast({
          title: "Error",
          description: "No se pudo agregar el producto",
          variant: "destructive",
        });
        return;
      }

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        category: data.category,
        stock: data.stock,
        minStock: data.min_stock,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        description: data.description || undefined,
      };

      setProducts(prev => [newProduct, ...prev]);
      toast({
        title: "Éxito",
        description: "Producto agregado correctamente",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al agregar producto",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          category: updates.category,
          stock: updates.stock,
          min_stock: updates.minStock,
          price: updates.price,
          description: updates.description || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el producto",
          variant: "destructive",
        });
        return;
      }

      const updatedProduct: Product = {
        id: data.id,
        name: data.name,
        category: data.category,
        stock: data.stock,
        minStock: data.min_stock,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        description: data.description || undefined,
      };

      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al actualizar producto",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
        });
        return;
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar producto",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
};

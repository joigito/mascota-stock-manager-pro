
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  category: 'mascotas' | 'forrajeria';
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

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (error) {
        console.error('Error parsing saved products:', error);
        setProducts([]);
      }
    }
    setLoading(false);
  }, []);

  // Save products to localStorage whenever products change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, loading]);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProduct: Product = {
        ...productData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setProducts(prev => [...prev, newProduct]);
      return { error: null };
    } catch (error) {
      console.error('Error adding product:', error);
      return { error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      setProducts(prev => 
        prev.map(product => 
          product.id === id 
            ? { ...product, ...updates, updated_at: new Date().toISOString() }
            : product
        )
      );
      return { error: null };
    } catch (error) {
      console.error('Error updating product:', error);
      return { error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setProducts(prev => prev.filter(product => product.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { error };
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct
  };
};

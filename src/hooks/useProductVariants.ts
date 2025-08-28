import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "./useOrganization";
import { toast } from "sonner";

export interface ProductVariant {
  id: string;
  product_id: string;
  organization_id: string;
  sku?: string;
  color?: string;
  size?: string;
  stock: number;
  min_stock: number;
  price_adjustment: number;
  image_url?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductAttribute {
  id: string;
  product_id: string;
  organization_id: string;
  attribute_name: string;
  attribute_value: string;
  created_at: string;
}

export const useProductVariants = (productId?: string) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  const loadVariants = useCallback(async () => {
    if (!user || !currentOrganization || !productId) return;

    setLoading(true);
    try {
      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .eq("organization_id", currentOrganization.id)
        .order("color", { ascending: true })
        .order("size", { ascending: true });

      if (variantsError) throw variantsError;

      const { data: attributesData, error: attributesError } = await supabase
        .from("product_attributes")
        .select("*")
        .eq("product_id", productId)
        .eq("organization_id", currentOrganization.id);

      if (attributesError) throw attributesError;

      setVariants(variantsData || []);
      setAttributes(attributesData || []);
    } catch (error) {
      console.error("Error loading variants:", error);
      toast.error("Error al cargar variantes");
    } finally {
      setLoading(false);
    }
  }, [user, currentOrganization, productId]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  const addVariant = async (variantData: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'organization_id'>) => {
    if (!user || !currentOrganization) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("product_variants")
        .insert({
          ...variantData,
          organization_id: currentOrganization.id,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setVariants(prev => [...prev, data]);
      toast.success("Variante agregada exitosamente");
      return data;
    } catch (error) {
      console.error("Error adding variant:", error);
      toast.error("Error al agregar variante");
      throw error;
    }
  };

  const updateVariant = async (id: string, updates: Partial<ProductVariant>) => {
    if (!user || !currentOrganization) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("product_variants")
        .update(updates)
        .eq("id", id)
        .eq("organization_id", currentOrganization.id)
        .select()
        .single();

      if (error) throw error;

      setVariants(prev => prev.map(variant => 
        variant.id === id ? data : variant
      ));
      toast.success("Variante actualizada");
      return data;
    } catch (error) {
      console.error("Error updating variant:", error);
      toast.error("Error al actualizar variante");
      throw error;
    }
  };

  const deleteVariant = async (id: string) => {
    if (!user || !currentOrganization) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", id)
        .eq("organization_id", currentOrganization.id);

      if (error) throw error;

      setVariants(prev => prev.filter(variant => variant.id !== id));
      toast.success("Variante eliminada");
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Error al eliminar variante");
      throw error;
    }
  };

  const addAttribute = async (attributeData: Omit<ProductAttribute, 'id' | 'created_at' | 'organization_id'>) => {
    if (!user || !currentOrganization) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("product_attributes")
        .insert({
          ...attributeData,
          organization_id: currentOrganization.id
        })
        .select()
        .single();

      if (error) throw error;

      setAttributes(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Error adding attribute:", error);
      toast.error("Error al agregar atributo");
      throw error;
    }
  };

  const getUniqueColors = () => {
    return [...new Set(variants.map(v => v.color).filter(Boolean))];
  };

  const getUniqueSizes = () => {
    return [...new Set(variants.map(v => v.size).filter(Boolean))];
  };

  const getVariantsByColor = (color: string) => {
    return variants.filter(v => v.color === color);
  };

  const getVariantsBySize = (size: string) => {
    return variants.filter(v => v.size === size);
  };

  const getTotalStock = () => {
    return variants.reduce((total, variant) => total + variant.stock, 0);
  };

  return {
    variants,
    attributes,
    loading,
    addVariant,
    updateVariant,
    deleteVariant,
    addAttribute,
    loadVariants,
    getUniqueColors,
    getUniqueSizes,
    getVariantsByColor,
    getVariantsBySize,
    getTotalStock
  };
};
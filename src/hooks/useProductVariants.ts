import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

const variantsKey = (orgId: string, productId: string) =>
  ['product-variants', orgId, productId] as const;
const attributesKey = (orgId: string, productId: string) =>
  ['product-attributes', orgId, productId] as const;

export const useProductVariants = (productId?: string) => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  const orgId = currentOrganization?.id;

  const variantsQuery = useQuery({
    queryKey: variantsKey(orgId || 'none', productId || 'none'),
    queryFn: async (): Promise<ProductVariant[]> => {
      if (!user || !orgId || !productId) return [];

      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .eq("organization_id", orgId)
        .order('color', { ascending: true })
        .order('size', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!orgId && !!productId,
    staleTime: 5 * 60 * 1000,
  });

  const attributesQuery = useQuery({
    queryKey: attributesKey(orgId || 'none', productId || 'none'),
    queryFn: async (): Promise<ProductAttribute[]> => {
      if (!user || !orgId || !productId) return [];

      const { data, error } = await supabase
        .from("product_attributes")
        .select("*")
        .eq("product_id", productId)
        .eq("organization_id", orgId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!orgId && !!productId,
    staleTime: 5 * 60 * 1000,
  });

  const variants = variantsQuery.data ?? [];
  const attributes = attributesQuery.data ?? [];

  const loadVariants = useCallback(() => {
    return Promise.all([
      queryClient.refetchQueries({ queryKey: variantsKey(orgId || 'none', productId || 'none') }),
      queryClient.refetchQueries({ queryKey: attributesKey(orgId || 'none', productId || 'none') }),
    ]);
  }, [queryClient, orgId, productId]);

  const addVariant = async (variantData: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'organization_id'>) => {
    if (!user || !orgId) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const { data: newVariant, error } = await supabase
        .from("product_variants")
        .insert({
          ...variantData,
          organization_id: orgId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await loadVariants();
      toast.success("Variante agregada exitosamente");
      return newVariant;
    } catch (error) {
      console.error("Error adding variant:", error);
      toast.error("Error al agregar variante");
      throw error;
    }
  };

  const updateVariant = async (id: string, updates: Partial<ProductVariant>) => {
    if (!user || !orgId) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const { data: updated, error } = await supabase
        .from("product_variants")
        .update(updates)
        .eq("id", id)
        .eq("organization_id", orgId)
        .select()
        .single();

      if (error) throw error;

      await loadVariants();
      toast.success("Variante actualizada");
      return updated;
    } catch (error) {
      console.error("Error updating variant:", error);
      toast.error("Error al actualizar variante");
      throw error;
    }
  };

  const deleteVariant = async (id: string) => {
    if (!user || !orgId) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", id)
        .eq("organization_id", orgId);

      if (error) throw error;

      queryClient.setQueryData<ProductVariant[]>(variantsKey(orgId, productId || 'none'), (prev) =>
        (prev ?? []).filter(variant => variant.id !== id)
      );
      toast.success("Variante eliminada");
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Error al eliminar variante");
      throw error;
    }
  };

  const addAttribute = async (attributeData: Omit<ProductAttribute, 'id' | 'created_at' | 'organization_id'>) => {
    if (!user || !orgId) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const { data: newAttr, error } = await supabase
        .from("product_attributes")
        .insert({
          ...attributeData,
          organization_id: orgId
        })
        .select()
        .single();

      if (error) throw error;
      await loadVariants();
      return newAttr;
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
    loading: (variantsQuery.isLoading && !variantsQuery.data) || (attributesQuery.isLoading && !attributesQuery.data),
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
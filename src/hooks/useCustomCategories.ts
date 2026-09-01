import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';

interface CustomCategory {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

const categoriesKey = (orgId: string) => ['custom-categories', orgId] as const;

export const useCustomCategories = () => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const orgId = currentOrganization?.id;

  const query = useQuery({
    queryKey: categoriesKey(orgId || 'none'),
    queryFn: async (): Promise<CustomCategory[]> => {
      if (!user || !orgId) return [];

      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const categories = query.data ?? [];

  const loadCategories = async () => {
    await queryClient.refetchQueries({ queryKey: categoriesKey(orgId || 'none') });
  };

  const createCategory = async (name: string, description?: string) => {
    if (!user || !orgId) {
      toast({
        title: "Error",
        description: "Usuario o organización no válidos",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .insert({
          organization_id: orgId,
          name: name.trim(),
          description: description?.trim(),
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.setQueryData<CustomCategory[]>(categoriesKey(orgId), (prev) =>
        [...(prev ?? []), data].sort((a, b) => a.name.localeCompare(b.name))
      );
      toast({
        title: "Éxito",
        description: "Categoría creada exitosamente",
      });
      return true;
    } catch (error: any) {
      console.error('Error creating category:', error);
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "Ya existe una categoría con ese nombre",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Error al crear la categoría",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const updateCategory = async (id: string, name: string, description?: string) => {
    if (!user || !orgId) {
      toast({
        title: "Error",
        description: "Usuario o organización no válidos",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .update({
          name: name.trim(),
          description: description?.trim(),
        })
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single();

      if (error) throw error;

      queryClient.setQueryData<CustomCategory[]>(categoriesKey(orgId), (prev) =>
        (prev ?? []).map(cat => cat.id === id ? data : cat).sort((a, b) => a.name.localeCompare(b.name))
      );
      toast({
        title: "Éxito",
        description: "Categoría actualizada exitosamente",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating category:', error);
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "Ya existe una categoría con ese nombre",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar la categoría",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user || !orgId) {
      toast({
        title: "Error",
        description: "Usuario o organización no válidos",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('organization_id', orgId)
        .eq('category', categories.find(cat => cat.id === id)?.name)
        .limit(1);

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        toast({
          title: "Error",
          description: "No se puede eliminar una categoría que tiene productos asignados",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) throw error;

      queryClient.setQueryData<CustomCategory[]>(categoriesKey(orgId), (prev) =>
        (prev ?? []).filter(cat => cat.id !== id)
      );
      toast({
        title: "Éxito",
        description: "Categoría eliminada exitosamente",
      });
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la categoría",
        variant: "destructive",
      });
      return false;
    }
  };

  const migrateExistingCategories = async () => {
    if (!user || !orgId) return;

    try {
      const { error } = await supabase.rpc('migrate_organization_categories', {
        _org_id: orgId
      });

      if (error) throw error;

      await loadCategories();
      toast({
        title: "Éxito",
        description: "Categorías existentes migradas exitosamente",
      });
    } catch (error) {
      console.error('Error migrating categories:', error);
      toast({
        title: "Error",
        description: "Error al migrar las categorías existentes",
        variant: "destructive",
      });
    }
  };

  return {
    categories,
    loading: query.isLoading && !query.data,
    createCategory,
    updateCategory,
    deleteCategory,
    migrateExistingCategories,
    reloadCategories: loadCategories,
  };
};
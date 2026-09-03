import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';

export interface Supplier {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  contact_info?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

const suppliersKey = (orgId: string) => ['suppliers', orgId] as const;

export const useSuppliers = () => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const orgId = currentOrganization?.id;

  const query = useQuery({
    queryKey: suppliersKey(orgId || 'none'),
    queryFn: async (): Promise<Supplier[]> => {
      if (!user || !orgId) return [];

      const { data, error } = await supabase
        .from('suppliers')
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

  const suppliers = query.data ?? [];

  const loadSuppliers = async () => {
    await queryClient.refetchQueries({ queryKey: suppliersKey(orgId || 'none') });
  };

  const createSupplier = async (name: string, description?: string, contactInfo?: string) => {
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
        .from('suppliers')
        .insert({
          organization_id: orgId,
          name: name.trim(),
          description: description?.trim() || null,
          contact_info: contactInfo?.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.setQueryData<Supplier[]>(suppliersKey(orgId), (prev) =>
        [...(prev ?? []), data].sort((a, b) => a.name.localeCompare(b.name))
      );
      toast({
        title: "Éxito",
        description: "Proveedor creado exitosamente",
      });
      return true;
    } catch (error: any) {
      console.error('Error creating supplier:', error);
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "Ya existe un proveedor con ese nombre",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Error al crear el proveedor",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const updateSupplier = async (id: string, name: string, description?: string, contactInfo?: string) => {
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
        .from('suppliers')
        .update({
          name: name.trim(),
          description: description?.trim() || null,
          contact_info: contactInfo?.trim() || null,
        })
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single();

      if (error) throw error;

      queryClient.setQueryData<Supplier[]>(suppliersKey(orgId), (prev) =>
        (prev ?? []).map(s => s.id === id ? data : s).sort((a, b) => a.name.localeCompare(b.name))
      );
      toast({
        title: "Éxito",
        description: "Proveedor actualizado exitosamente",
      });
      return true;
    } catch (error: any) {
      console.error('Error updating supplier:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el proveedor",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSupplier = async (id: string) => {
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
        .eq('supplier_id', id)
        .limit(1);

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        toast({
          title: "Error",
          description: "No se puede eliminar un proveedor que tiene productos asignados",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) throw error;

      queryClient.setQueryData<Supplier[]>(suppliersKey(orgId), (prev) =>
        (prev ?? []).filter(s => s.id !== id)
      );
      toast({
        title: "Éxito",
        description: "Proveedor eliminado exitosamente",
      });
      return true;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el proveedor",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    suppliers,
    loading: query.isLoading && !query.data,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    reloadSuppliers: loadSuppliers,
  };
};

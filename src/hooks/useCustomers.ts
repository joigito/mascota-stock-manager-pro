import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from './useOrganization';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  organization_id: string;
  created_at?: string;
}

const customersKey = (orgId: string) => ['customers', orgId] as const;

export const useCustomers = () => {
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const orgId = currentOrganization?.id;

  const loadCustomers = async (): Promise<Customer[]> => {
    if (!user || !orgId) {
      return [];
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      organization_id: customer.organization_id,
      created_at: customer.created_at,
    }));
  };

  const query = useQuery({
    queryKey: customersKey(orgId || 'none'),
    queryFn: loadCustomers,
    enabled: !!user && !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const customers = query.data ?? [];

  // Migrar datos de localStorage a Supabase
  const migrateLocalStorageData = async () => {
    if (!user || !orgId) return;

    const savedCustomers = localStorage.getItem('customers');
    if (!savedCustomers) return;

    try {
      const localCustomers = JSON.parse(savedCustomers);

      for (const customer of localCustomers) {
        const { error } = await supabase
          .from('customers')
          .insert({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            user_id: user.id,
            organization_id: orgId
          });

        if (error && !error.message.includes('duplicate key')) {
          console.error('Error migrando cliente:', error);
        }
      }

      localStorage.removeItem('customers');
      toast({
        title: "Migración completada",
        description: "Clientes migrados a la base de datos",
      });
      queryClient.invalidateQueries({ queryKey: customersKey(orgId) });
    } catch (error) {
      console.error('Error durante la migración de clientes:', error);
    }
  };

  // Sincronizar manualmente
  const syncCustomers = async () => {
    setSyncing(true);
    try {
      await queryClient.refetchQueries({ queryKey: customersKey(orgId || 'none') });
      toast({
        title: "Sincronización completada",
        description: "Clientes actualizados desde la base de datos",
      });
    } finally {
      setSyncing(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'organization_id'>) => {
    if (!user || !orgId) {
      return { error: new Error('Usuario no autenticado o organización no seleccionada') };
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          user_id: user.id,
          organization_id: orgId
        })
        .select()
        .single();

      if (error) throw error;

      const newCustomer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        organization_id: data.organization_id,
        created_at: data.created_at,
      };

      queryClient.setQueryData<Customer[]>(customersKey(orgId), (prev) => [newCustomer, ...(prev ?? [])]);
      return { error: null };
    } catch (error) {
      console.error('Error agregando cliente:', error);
      return { error };
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    if (!user || !orgId) {
      return { error: new Error('Usuario no autenticado') };
    }

    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      queryClient.setQueryData<Customer[]>(customersKey(orgId), (prev) =>
        (prev ?? []).map(customer =>
          customer.id === id
            ? { ...customer, ...updates }
            : customer
        )
      );
      return { error: null };
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      return { error };
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user || !orgId) {
      return { error: new Error('Usuario no autenticado') };
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.setQueryData<Customer[]>(customersKey(orgId), (prev) =>
        (prev ?? []).filter(customer => customer.id !== id)
      );
      return { error: null };
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      return { error };
    }
  };

  return {
    customers,
    loading: query.isLoading && !query.data,
    syncing,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    syncCustomers
  };
};
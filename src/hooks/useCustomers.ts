
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Migrar datos de localStorage a Supabase
  const migrateLocalStorageData = async () => {
    if (!user) return;

    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      try {
        const localCustomers = JSON.parse(savedCustomers);
        console.log('Migrando clientes de localStorage a Supabase:', localCustomers.length);
        
        for (const customer of localCustomers) {
          const { error } = await supabase
            .from('customers')
            .insert({
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              user_id: user.id
            });
          
          if (error && !error.message.includes('duplicate key')) {
            console.error('Error migrando cliente:', error);
          }
        }
        
        // Limpiar localStorage después de migrar
        localStorage.removeItem('customers');
        toast({
          title: "Migración completada",
          description: "Clientes migrados a la base de datos",
        });
      } catch (error) {
        console.error('Error durante la migración de clientes:', error);
      }
    }
  };

  // Cargar clientes desde Supabase
  const loadCustomers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCustomers: Customer[] = data.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email || undefined,
        phone: customer.phone || undefined,
        address: customer.address || undefined,
        created_at: customer.created_at,
      }));

      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar manualmente
  const syncCustomers = async () => {
    setSyncing(true);
    await loadCustomers();
    setSyncing(false);
    toast({
      title: "Sincronización completada",
      description: "Clientes actualizados desde la base de datos",
    });
  };

  useEffect(() => {
    if (user) {
      migrateLocalStorageData().then(() => {
        loadCustomers();
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
    if (!user) {
      return { error: new Error('Usuario no autenticado') };
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          user_id: user.id
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
        created_at: data.created_at,
      };

      setCustomers(prev => [newCustomer, ...prev]);
      return { error: null };
    } catch (error) {
      console.error('Error agregando cliente:', error);
      return { error };
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    if (!user) {
      return { error: new Error('Usuario no autenticado') };
    }

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          address: updates.address
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCustomers(prev => 
        prev.map(customer => 
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
    if (!user) {
      return { error: new Error('Usuario no autenticado') };
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCustomers(prev => prev.filter(customer => customer.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      return { error };
    }
  };

  return {
    customers,
    loading,
    syncing,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    syncCustomers
  };
};

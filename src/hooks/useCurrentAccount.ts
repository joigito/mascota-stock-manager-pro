import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { toast } from 'sonner';

interface CustomerAccount {
  id: string;
  customer_id: string;
  organization_id: string;
  balance: number;
  credit_limit: number;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    cuit_dni?: string;
  };
}

interface AccountTransaction {
  id: string;
  customer_account_id: string;
  organization_id: string;
  transaction_type: 'sale' | 'payment' | 'adjustment';
  amount: number;
  balance_after: number;
  reference_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export const useCurrentAccount = () => {
  const { currentOrganization } = useOrganization();
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (currentOrganization?.id) {
      loadCurrentAccountStatus();
      if (currentOrganization.current_account_enabled) {
        loadAccounts();
      }
    }
  }, [currentOrganization?.id]);

  const loadCurrentAccountStatus = async () => {
    if (!currentOrganization?.id) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('current_account_enabled')
        .eq('id', currentOrganization.id)
        .single();

      if (error) throw error;
      setIsEnabled(data?.current_account_enabled || false);
    } catch (error) {
      console.error('Error loading current account status:', error);
    }
  };

  const loadAccounts = async () => {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_accounts')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Error al cargar cuentas corrientes');
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateAccount = async (customerId: string): Promise<CustomerAccount | null> => {
    if (!currentOrganization?.id) return null;

    try {
      // Check if account exists
      const { data: existing, error: fetchError } = await supabase
        .from('customer_accounts')
        .select('*')
        .eq('customer_id', customerId)
        .eq('organization_id', currentOrganization.id)
        .single();

      if (existing) return existing;

      // Create new account
      const { data, error } = await supabase
        .from('customer_accounts')
        .insert({
          customer_id: customerId,
          organization_id: currentOrganization.id,
          balance: 0,
          credit_limit: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting/creating account:', error);
      toast.error('Error al crear cuenta corriente');
      return null;
    }
  };

  const addTransaction = async (
    customerId: string,
    type: 'sale' | 'payment' | 'adjustment',
    amount: number,
    notes?: string,
    referenceId?: string
  ) => {
    if (!currentOrganization?.id) return false;

    try {
      const account = await getOrCreateAccount(customerId);
      if (!account) return false;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      // Calculate new balance
      let newBalance = account.balance;
      if (type === 'sale') {
        newBalance += amount; // Sale increases debt
      } else if (type === 'payment') {
        newBalance -= amount; // Payment decreases debt
      } else {
        newBalance = amount; // Adjustment sets balance
      }

      // Insert transaction
      const { error: txError } = await supabase
        .from('account_transactions')
        .insert({
          customer_account_id: account.id,
          organization_id: currentOrganization.id,
          transaction_type: type,
          amount,
          balance_after: newBalance,
          reference_id: referenceId,
          notes,
          created_by: user.user.id
        });

      if (txError) throw txError;

      // Update account balance
      const { error: updateError } = await supabase
        .from('customer_accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

      if (updateError) throw updateError;

      toast.success('Transacción registrada correctamente');
      await loadAccounts();
      return true;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Error al registrar transacción');
      return false;
    }
  };

  const getTransactions = async (customerAccountId: string): Promise<AccountTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('account_transactions')
        .select('*')
        .eq('customer_account_id', customerAccountId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as AccountTransaction[];
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Error al cargar movimientos');
      return [];
    }
  };

  const updateCreditLimit = async (accountId: string, creditLimit: number) => {
    try {
      const { error } = await supabase
        .from('customer_accounts')
        .update({ credit_limit: creditLimit })
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Límite de crédito actualizado');
      await loadAccounts();
      return true;
    } catch (error) {
      console.error('Error updating credit limit:', error);
      toast.error('Error al actualizar límite de crédito');
      return false;
    }
  };

  return {
    accounts,
    loading,
    isEnabled,
    loadAccounts,
    addTransaction,
    getTransactions,
    updateCreditLimit,
    getOrCreateAccount
  };
};

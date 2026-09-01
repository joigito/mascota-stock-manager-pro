import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useFeatureFlag } from './useFeatureFlag';
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

const accountsKey = (orgId: string) => ['customer-accounts', orgId] as const;

export const useCurrentAccount = () => {
  const { currentOrganization } = useOrganization();
  const { isEnabled } = useFeatureFlag('current_account', currentOrganization?.id);
  const queryClient = useQueryClient();

  const orgId = currentOrganization?.id;

  const query = useQuery({
    queryKey: accountsKey(orgId || 'none'),
    queryFn: async (): Promise<CustomerAccount[]> => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from('customer_accounts')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('organization_id', orgId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId && isEnabled,
    staleTime: 5 * 60 * 1000,
  });

  const accounts = query.data ?? [];

  const loadAccounts = async () => {
    await queryClient.refetchQueries({ queryKey: accountsKey(orgId || 'none') });
  };

  const getOrCreateAccount = async (customerId: string): Promise<CustomerAccount | null> => {
    if (!orgId) return null;

    try {
    const { data: existing } = await supabase
      .from('customer_accounts')
      .select('*')
      .eq('customer_id', customerId)
      .eq('organization_id', orgId)
      .maybeSingle();

    if (existing) return existing;

      const { data, error } = await supabase
        .from('customer_accounts')
        .insert({
          customer_id: customerId,
          organization_id: orgId,
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
    if (!orgId) return false;

    try {
      const account = await getOrCreateAccount(customerId);
      if (!account) return false;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      let newBalance = account.balance;
      if (type === 'sale') {
        newBalance += amount;
      } else if (type === 'payment') {
        newBalance -= amount;
      } else {
        newBalance = amount;
      }

      const { error: txError } = await supabase
        .from('account_transactions')
        .insert({
          customer_account_id: account.id,
          organization_id: orgId,
          transaction_type: type,
          amount,
          balance_after: newBalance,
          reference_id: referenceId,
          notes,
          created_by: user.user.id
        });

      if (txError) throw txError;

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

  const deleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('delete-transaction', {
        body: { transactionId },
      });

      if (error) throw error;

      toast.success('Transacción eliminada correctamente');
      await loadAccounts();
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Error al eliminar transacción');
      return false;
    }
  };

  const updateTransaction = async (transactionId: string, updates: Partial<AccountTransaction>) => {
    try {
      const { error } = await supabase.functions.invoke('update-transaction', {
        body: { transactionId, updates },
      });

      if (error) throw error;

      toast.success('Transacción actualizada correctamente');
      await loadAccounts();
      return true;
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Error al actualizar transacción');
      return false;
    }
  };

  return {
    accounts,
    loading: query.isLoading && !query.data,
    isEnabled,
    loadAccounts,
    addTransaction,
    getTransactions,
    updateCreditLimit,
    getOrCreateAccount,
    deleteTransaction,
    updateTransaction
  };
};
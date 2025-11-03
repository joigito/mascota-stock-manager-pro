import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCustomers } from '@/hooks/useCustomers';
import { CreditCard, DollarSign, Eye, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const CurrentAccountTab = () => {
  const { accounts, loading, isEnabled, addTransaction, getTransactions, updateCreditLimit, deleteTransaction, updateTransaction } = useCurrentAccount();
  const { customers, loading: loadingCustomers } = useCustomers();
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showMovementsDialog, setShowMovementsDialog] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);

  const [transactionForm, setTransactionForm] = useState({
    customerId: '',
    type: 'payment' as 'sale' | 'payment' | 'adjustment',
    amount: '',
    notes: ''
  });

  const [editTransactionForm, setEditTransactionForm] = useState({
    id: '',
    type: 'payment' as 'sale' | 'payment' | 'adjustment',
    amount: '',
    notes: ''
  });

  if (!isEnabled) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cuenta Corriente no habilitada</CardTitle>
            <CardDescription>
              Este módulo no está habilitado para tu organización. Contacta al administrador del sistema.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleAddTransaction = async () => {
    if (!transactionForm.customerId || !transactionForm.amount) return;

    const success = await addTransaction(
      transactionForm.customerId,
      transactionForm.type,
      parseFloat(transactionForm.amount),
      transactionForm.notes || undefined
    );

    if (success) {
      setShowTransactionDialog(false);
      setTransactionForm({
        customerId: '',
        type: 'payment',
        amount: '',
        notes: ''
      });
    }
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return;

    const success = await updateTransaction(editingTransaction.id, {
      transaction_type: editTransactionForm.type,
      amount: parseFloat(editTransactionForm.amount),
      notes: editTransactionForm.notes || undefined
    });

    if (success) {
      setEditingTransaction(null);
      handleViewMovements(selectedAccountId);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const success = await deleteTransaction(transactionId);
    if (success) {
      handleViewMovements(selectedAccountId);
    }
  };

  const handleViewMovements = async (accountId: string) => {
    setSelectedAccountId(accountId);
    setShowMovementsDialog(true);
    setLoadingTransactions(true);
    const txs = await getTransactions(accountId);
    setTransactions(txs);
    setLoadingTransactions(false);
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return 'Venta';
      case 'payment': return 'Pago';
      case 'adjustment': return 'Ajuste';
      default: return type;
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-destructive';
    if (balance < 0) return 'text-green-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Cuenta Corriente</h2>
          <p className="text-muted-foreground">Gestión de deudas y pagos de clientes</p>
        </div>
        <Button onClick={() => setShowTransactionDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Transacción
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cuentas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${accounts.reduce((sum, acc) => sum + (acc.balance > 0 ? acc.balance : 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes con Deuda</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accounts.filter(acc => acc.balance > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cuentas de Clientes</CardTitle>
          <CardDescription>Listado de cuentas corrientes activas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando...</p>
          ) : accounts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay cuentas corrientes</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>CUIT/DNI</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Límite</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.customer?.name || 'Sin nombre'}
                    </TableCell>
                    <TableCell>{account.customer?.cuit_dni || '-'}</TableCell>
                    <TableCell className={`text-right font-semibold ${getBalanceColor(account.balance)}`}>
                      ${account.balance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${account.credit_limit.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewMovements(account.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Transacción</DialogTitle>
            <DialogDescription>
              Registra un pago, venta a crédito o ajuste de cuenta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Cliente</Label>
              <Select
                value={transactionForm.customerId}
                onValueChange={(value) => setTransactionForm({ ...transactionForm, customerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo de Transacción</Label>
              <Select
                value={transactionForm.type}
                onValueChange={(value: any) => setTransactionForm({ ...transactionForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Pago</SelectItem>
                  <SelectItem value="sale">Venta a Crédito</SelectItem>
                  <SelectItem value="adjustment">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={transactionForm.notes}
                onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                placeholder="Descripción de la transacción..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTransaction}>
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movements Dialog */}
      <Dialog open={showMovementsDialog} onOpenChange={setShowMovementsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Movimientos de Cuenta</DialogTitle>
            <DialogDescription>
              Historial de transacciones del cliente
            </DialogDescription>
          </DialogHeader>
          {loadingTransactions ? (
            <p className="text-center py-8">Cargando movimientos...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>{getTransactionTypeLabel(tx.transaction_type)}</TableCell>
                    <TableCell className={`text-right ${tx.transaction_type === 'sale' ? 'text-destructive' : 'text-green-600'}`}>
                      {tx.transaction_type === 'sale' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${getBalanceColor(tx.balance_after)}`}>
                      ${tx.balance_after.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTransaction(tx);
                          setEditTransactionForm({
                            id: tx.id,
                            type: tx.transaction_type,
                            amount: tx.amount.toString(),
                            notes: tx.notes || ''
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(tx.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Transacción</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type">Tipo de Transacción</Label>
              <Select
                value={editTransactionForm.type}
                onValueChange={(value: any) => setEditTransactionForm({ ...editTransactionForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Pago</SelectItem>
                  <SelectItem value="sale">Venta a Crédito</SelectItem>
                  <SelectItem value="adjustment">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-amount">Monto</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editTransactionForm.amount}
                onChange={(e) => setEditTransactionForm({ ...editTransactionForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Notas (opcional)</Label>
              <Textarea
                id="edit-notes"
                value={editTransactionForm.notes}
                onChange={(e) => setEditTransactionForm({ ...editTransactionForm, notes: e.target.value })}
                placeholder="Descripción de la transacción..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTransaction(null)}>
              Cancelar
            </Button>
            <Button onClick={() => handleUpdateTransaction()}>
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
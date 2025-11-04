import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOrganization } from "@/hooks/useOrganization";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cuit_dni?: string;
  fiscal_address?: string;
}

interface AccountTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  notes?: string;
  created_at: string;
}

interface CustomerAccount {
  id: string;
  balance: number;
  credit_limit?: number | null;
  customer?: Customer;
}

interface AccountStatementPrintProps {
  account: CustomerAccount | null;
  transactions: AccountTransaction[];
  isOpen: boolean;
  onClose: () => void;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}

const AccountStatementPrint = ({ 
  account, 
  transactions, 
  isOpen, 
  onClose,
  dateRange 
}: AccountStatementPrintProps) => {
  const { currentOrganization } = useOrganization();

  if (!account || !account.customer) return null;

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "sale":
        return "Venta";
      case "payment":
        return "Pago";
      case "adjustment":
        return "Ajuste";
      default:
        return type;
    }
  };

  const calculateSummary = () => {
    let totalSales = 0;
    let totalPayments = 0;
    let totalAdjustments = 0;

    transactions.forEach((t) => {
      if (t.transaction_type === "sale") {
        totalSales += Number(t.amount);
      } else if (t.transaction_type === "payment") {
        totalPayments += Number(t.amount);
      } else if (t.transaction_type === "adjustment") {
        totalAdjustments += Number(t.amount);
      }
    });

    const previousBalance = transactions.length > 0 
      ? Number(transactions[0].balance_after) - Number(transactions[0].amount)
      : 0;

    return {
      previousBalance,
      totalSales,
      totalPayments,
      totalAdjustments,
      currentBalance: account.balance,
    };
  };

  const summary = calculateSummary();
  const creditAvailable = account.credit_limit 
    ? Number(account.credit_limit) - Number(account.balance)
    : null;

  const handlePrint = () => {
    const printContent = document.getElementById("account-statement-print-content");
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Estado de Cuenta - ${account.customer.name}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px;
                  color: #000;
                  background: #fff;
                }
                .statement-header { 
                  text-align: center; 
                  margin-bottom: 30px;
                  border-bottom: 2px solid #333;
                  padding-bottom: 20px;
                }
                .statement-header h1 {
                  margin: 0 0 10px 0;
                  font-size: 24px;
                }
                .statement-header h2 {
                  margin: 0;
                  font-size: 18px;
                  font-weight: normal;
                  color: #666;
                }
                .customer-info { 
                  margin-bottom: 30px;
                  padding: 15px;
                  background: #f5f5f5;
                  border-radius: 5px;
                }
                .customer-info h3 {
                  margin-top: 0;
                  margin-bottom: 10px;
                }
                .customer-info p {
                  margin: 5px 0;
                }
                .date-range {
                  text-align: center;
                  font-weight: bold;
                  margin-bottom: 20px;
                  padding: 10px;
                  background: #e8e8e8;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 20px 0;
                }
                th, td { 
                  border: 1px solid #ddd; 
                  padding: 10px; 
                  text-align: left;
                }
                th { 
                  background-color: #333;
                  color: #fff;
                  font-weight: bold;
                }
                tbody tr:nth-child(even) {
                  background-color: #f9f9f9;
                }
                .text-right { text-align: right; }
                .summary { 
                  margin-top: 30px;
                  padding: 20px;
                  background: #f5f5f5;
                  border-radius: 5px;
                }
                .summary h3 {
                  margin-top: 0;
                  margin-bottom: 15px;
                  border-bottom: 2px solid #333;
                  padding-bottom: 10px;
                }
                .summary-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 8px 0;
                  padding: 5px 0;
                }
                .summary-row.total {
                  font-weight: bold;
                  font-size: 18px;
                  border-top: 2px solid #333;
                  padding-top: 10px;
                  margin-top: 15px;
                }
                .positive { color: #16a34a; }
                .negative { color: #dc2626; }
                @media print { 
                  .no-print { display: none; }
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Estado de Cuenta Corriente
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div id="account-statement-print-content" className="space-y-6 p-6 print-content">
          {/* Header */}
          <div className="statement-header text-center border-b pb-6">
            <h1 className="text-2xl font-bold">{currentOrganization?.name || "Empresa"}</h1>
            <h2 className="text-lg text-muted-foreground mt-2">Estado de Cuenta Corriente</h2>
          </div>

          {/* Customer Info */}
          <div className="customer-info bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Información del Cliente:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p><strong>Nombre:</strong> {account.customer.name}</p>
              {account.customer.cuit_dni && (
                <p><strong>CUIT/DNI:</strong> {account.customer.cuit_dni}</p>
              )}
              {account.customer.email && (
                <p><strong>Email:</strong> {account.customer.email}</p>
              )}
              {account.customer.phone && (
                <p><strong>Teléfono:</strong> {account.customer.phone}</p>
              )}
              {account.customer.fiscal_address && (
                <p className="col-span-2"><strong>Dirección Fiscal:</strong> {account.customer.fiscal_address}</p>
              )}
            </div>
          </div>

          {/* Date Range */}
          {dateRange && (dateRange.from || dateRange.to) && (
            <div className="date-range bg-muted p-3 rounded text-center">
              <strong>Período: </strong>
              {dateRange.from && format(dateRange.from, "dd/MM/yyyy")}
              {dateRange.from && dateRange.to && " - "}
              {dateRange.to && format(dateRange.to, "dd/MM/yyyy")}
              {!dateRange.from && dateRange.to && `Hasta ${format(dateRange.to, "dd/MM/yyyy")}`}
              {dateRange.from && !dateRange.to && `Desde ${format(dateRange.from, "dd/MM/yyyy")}`}
            </div>
          )}

          {/* Transactions Table */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Detalle de Movimientos:</h3>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Fecha</th>
                  <th className="border p-2 text-left">Tipo</th>
                  <th className="border p-2 text-left">Descripción</th>
                  <th className="border p-2 text-right">Debe</th>
                  <th className="border p-2 text-right">Haber</th>
                  <th className="border p-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border p-4 text-center text-muted-foreground">
                      No hay movimientos en este período
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const isDebe = transaction.transaction_type === "sale" || 
                                   (transaction.transaction_type === "adjustment" && Number(transaction.amount) > 0);
                    const isHaber = transaction.transaction_type === "payment" ||
                                    (transaction.transaction_type === "adjustment" && Number(transaction.amount) < 0);
                    
                    return (
                      <tr key={transaction.id}>
                        <td className="border p-2">
                          {format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm")}
                        </td>
                        <td className="border p-2">
                          {getTransactionTypeLabel(transaction.transaction_type)}
                        </td>
                        <td className="border p-2">
                          {transaction.notes || "-"}
                        </td>
                        <td className="border p-2 text-right">
                          {isDebe ? `$${Math.abs(Number(transaction.amount)).toLocaleString()}` : "-"}
                        </td>
                        <td className="border p-2 text-right">
                          {isHaber ? `$${Math.abs(Number(transaction.amount)).toLocaleString()}` : "-"}
                        </td>
                        <td className="border p-2 text-right font-semibold">
                          ${Number(transaction.balance_after).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="summary bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">Resumen:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Saldo anterior:</span>
                <span className="font-semibold">${summary.previousBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total ventas (+):</span>
                <span className="font-semibold text-destructive">
                  ${summary.totalSales.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total pagos (-):</span>
                <span className="font-semibold" style={{ color: "hsl(var(--chart-2))" }}>
                  ${summary.totalPayments.toLocaleString()}
                </span>
              </div>
              {summary.totalAdjustments !== 0 && (
                <div className="flex justify-between">
                  <span>Ajustes:</span>
                  <span className="font-semibold">
                    ${summary.totalAdjustments.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
                <span>Saldo actual:</span>
                <span className={summary.currentBalance > 0 ? "text-destructive" : ""}>
                  ${summary.currentBalance.toLocaleString()}
                </span>
              </div>
              {account.credit_limit !== null && account.credit_limit !== undefined && (
                <>
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <span>Límite de crédito:</span>
                    <span className="font-semibold">${Number(account.credit_limit).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crédito disponible:</span>
                    <span className="font-semibold" style={{ color: creditAvailable && creditAvailable > 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))" }}>
                      ${creditAvailable !== null ? creditAvailable.toLocaleString() : "0"}
                    </span>
                  </div>
                </>
              )}
              {(account.credit_limit === null || account.credit_limit === undefined) && (
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <span>Límite de crédito:</span>
                  <span className="font-semibold text-muted-foreground">Sin límite definido</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4 no-print">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handlePrint}>
            Imprimir / Guardar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountStatementPrint;

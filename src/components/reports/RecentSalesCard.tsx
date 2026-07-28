"use client";

import { ShoppingBag, Trash2, FileText, Receipt } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Sale } from "@/types/sales";
import { useSales } from "@/hooks/useSales";
import { useOrganization } from "@/hooks/useOrganization";
import { useElectronicInvoicing } from "@/hooks/useElectronicInvoicing";
import { useInvoices } from "@/hooks/useInvoices";
import { generateSaleReceipt } from "@/utils/saleReceiptGenerator";

interface RecentSalesCardProps {
  filteredSales: Sale[];
}

const RecentSalesCard = ({ filteredSales }: RecentSalesCardProps) => {
  const { toast } = useToast();
  const { deleteSale } = useSales();
  const { isAdmin, isSuperAdmin, currentOrganization } = useOrganization();
  const { isEnabled: isElectronicInvoicingEnabled } = useElectronicInvoicing(currentOrganization?.id);
  const { createInvoiceFromSale, loading: invoiceLoading } = useInvoices();

  const canDeleteSales = isAdmin() || isSuperAdmin();
  const canCreateInvoices = (isAdmin() || isSuperAdmin()) && isElectronicInvoicingEnabled;

  const handleDeleteSale = async (saleId: string, saleTotal: number, customerName: string) => {
    const { error } = await deleteSale(saleId);
    
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la venta",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Venta eliminada",
        description: `Venta de ${customerName} por $${saleTotal.toLocaleString()} eliminada exitosamente`,
      });
    }
  };

  const handleCreateInvoice = async (sale: Sale) => {
    try {
      await createInvoiceFromSale(sale);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
        <CardDescription>
          Últimas transacciones con información de rentabilidad
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredSales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay ventas registradas en este período</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSales.slice(0, 10).map((sale: Sale) => (
              <div key={sale.id} className="border rounded-lg">
                {/* Sale header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-muted/30 border-b gap-3">
                  <div>
                    <div className="font-medium">{sale.customer}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(sale.date).toLocaleDateString()} · {sale.items.length} {sale.items.length === 1 ? 'artículo' : 'artículos'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="font-semibold">${sale.total.toLocaleString()}</div>
                      <div className="text-sm text-foreground">
                        +${(sale.totalProfit || 0).toLocaleString()} ({(sale.averageMargin || 0).toFixed(1)}%)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateSaleReceipt(sale, currentOrganization?.name || 'Mi Negocio')}
                        className="hover:bg-muted/50"
                        title="Comprobante X"
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                      {canCreateInvoices && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateInvoice(sale)}
                          disabled={invoiceLoading}
                          className="text-primary hover:text-primary/90 hover:bg-muted/50"
                        >
                          <FileText className="h-4 w-4" />
                          {invoiceLoading ? "Creando..." : "Facturar"}
                        </Button>
                      )}
                      {canDeleteSales && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive/90 hover:bg-muted/50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar venta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente la venta de {sale.customer} por ${sale.total.toLocaleString()}.
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteSale(sale.id, sale.total, sale.customer)}
                            >
                              Eliminar venta
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
                {/* Items detail */}
                <div className="divide-y">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:px-4 gap-1 sm:gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{item.productName}</span>
                        {item.variantInfo && (
                          <span className="text-muted-foreground ml-1">({item.variantInfo})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-muted-foreground whitespace-nowrap">
                          {item.quantity} × ${item.finalUnitPrice.toLocaleString()}
                        </span>
                        <span className="font-medium whitespace-nowrap">${item.subtotal.toLocaleString()}</span>
                        <span className="text-green-600 dark:text-green-400 whitespace-nowrap">
                          +${item.profit.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground whitespace-nowrap w-12 text-right">
                          {item.margin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSalesCard;


import { ShoppingBag, Trash2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Sale } from "@/types/sales";
import { useSales } from "@/hooks/useSales";
import { useOrganization } from "@/hooks/useOrganization";
import { useElectronicInvoicing } from "@/hooks/useElectronicInvoicing";
import { useInvoices } from "@/hooks/useInvoices";

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
              <div key={sale.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{sale.customer}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(sale.date).toLocaleDateString()} - {sale.items.length} productos
                  </div>
                </div>
                  <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">${sale.total.toLocaleString()}</div>
                    <div className="text-sm text-foreground">
                      +${(sale.totalProfit || 0).toLocaleString()} 
                      ({(sale.averageMargin || 0).toFixed(1)}%)
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSalesCard;

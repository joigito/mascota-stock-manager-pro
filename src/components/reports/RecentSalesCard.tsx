
import { ShoppingBag, Trash2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Sale } from "@/types/sales";
import { useSales } from "@/hooks/useSales";
import { useOrganization } from "@/hooks/useOrganization";
import { useElectronicInvoicing } from "@/hooks/useElectronicInvoicing";

interface RecentSalesCardProps {
  filteredSales: Sale[];
}

const RecentSalesCard = ({ filteredSales }: RecentSalesCardProps) => {
  const { toast } = useToast();
  const { deleteSale } = useSales();
  const { isAdmin, isSuperAdmin, currentOrganization } = useOrganization();
  const { isEnabled: isElectronicInvoicingEnabled } = useElectronicInvoicing(currentOrganization?.id);

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
      // Aquí implementaremos la lógica de facturación más adelante
      toast({
        title: "Próximamente",
        description: `Función de facturación para la venta de ${sale.customer} estará disponible próximamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la factura",
        variant: "destructive",
      });
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
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay ventas registradas en este período</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSales.slice(0, 10).map((sale: Sale) => (
              <div key={sale.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{sale.customer}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(sale.date).toLocaleDateString()} - {sale.items.length} productos
                  </div>
                </div>
                  <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">${sale.total.toLocaleString()}</div>
                    <div className="text-sm text-green-600">
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
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <FileText className="h-4 w-4" />
                        Facturar
                      </Button>
                    )}
                    {canDeleteSales && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                            className="bg-red-600 hover:bg-red-700"
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

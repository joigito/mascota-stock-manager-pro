
import { ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/types/sales";

interface RecentSalesCardProps {
  filteredSales: Sale[];
}

const RecentSalesCard = ({ filteredSales }: RecentSalesCardProps) => {
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
                <div className="text-right">
                  <div className="font-semibold">${sale.total.toLocaleString()}</div>
                  <div className="text-sm text-green-600">
                    +${(sale.totalProfit || 0).toLocaleString()} 
                    ({(sale.averageMargin || 0).toFixed(1)}%)
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


import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/hooks/useProducts";

interface InventoryOverviewCardProps {
  products: Product[];
  totalInventoryValue: number;
  totalInventoryCost: number;
  potentialProfit: number;
  lowStockProducts: Product[];
  lowMarginProducts: Product[];
}

const InventoryOverviewCard = ({ 
  products, 
  totalInventoryValue, 
  totalInventoryCost, 
  potentialProfit, 
  lowStockProducts, 
  lowMarginProducts 
}: InventoryOverviewCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Resumen de Inventario</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total de productos:</span>
          <span className="font-semibold">{products.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Valor total del inventario:</span>
          <span className="font-semibold">${totalInventoryValue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Costo total del inventario:</span>
          <span className="font-semibold">${totalInventoryCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center border-t pt-2">
          <span className="text-sm text-green-600 font-medium">Ganancia potencial:</span>
          <span className="font-semibold text-green-600">${potentialProfit.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Productos con stock bajo:</span>
          <Badge variant={lowStockProducts.length > 0 ? "destructive" : "secondary"}>
            {lowStockProducts.length}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Productos con margen bajo:</span>
          <Badge variant={lowMarginProducts.length > 0 ? "destructive" : "secondary"}>
            {lowMarginProducts.length}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryOverviewCard;

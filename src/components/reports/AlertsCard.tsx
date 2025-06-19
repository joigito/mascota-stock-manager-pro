
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/hooks/useProducts";

interface AlertsCardProps {
  lowStockProducts: Product[];
  lowMarginProducts: Product[];
}

const AlertsCard = ({ lowStockProducts, lowMarginProducts }: AlertsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lowStockProducts.length === 0 && lowMarginProducts.length === 0 ? (
          <div className="text-center py-4 text-green-600">
            <p className="font-medium">✓ Todo está en orden</p>
            <p className="text-xs text-gray-500">Stock y márgenes adecuados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lowStockProducts.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">Stock Bajo:</h4>
                <div className="space-y-1">
                  {lowStockProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex justify-between items-center text-sm">
                      <span className="truncate">{product.name}</span>
                      <Badge variant="destructive" className="ml-2 text-xs">
                        {product.stock} restantes
                      </Badge>
                    </div>
                  ))}
                  {lowStockProducts.length > 3 && (
                    <p className="text-xs text-gray-500">
                      ... y {lowStockProducts.length - 3} más
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {lowMarginProducts.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-600 mb-2">Margen Bajo (&lt;20%):</h4>
                <div className="space-y-1">
                  {lowMarginProducts.slice(0, 3).map((product) => {
                    const margin = ((product.price - (product.costPrice || 0)) / product.price * 100);
                    return (
                      <div key={product.id} className="flex justify-between items-center text-sm">
                        <span className="truncate">{product.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {margin.toFixed(1)}%
                        </Badge>
                      </div>
                    );
                  })}
                  {lowMarginProducts.length > 3 && (
                    <p className="text-xs text-gray-500">
                      ... y {lowMarginProducts.length - 3} más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsCard;

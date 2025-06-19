
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductData } from "@/types/sales";

interface MostProfitableProductsCardProps {
  mostProfitableProducts: Array<[string, ProductData]>;
}

const MostProfitableProductsCard = ({ mostProfitableProducts }: MostProfitableProductsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Rentables</CardTitle>
        <CardDescription>
          Top 5 productos por ganancia generada
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mostProfitableProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay ventas registradas en este período</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mostProfitableProducts.map(([productId, data], index) => (
              <div key={productId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center bg-green-600">
                    {index + 1}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{data.name}</h4>
                    <p className="text-sm text-gray-600">
                      {data.margin.toFixed(1)}% margen
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">${data.profit.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">${data.revenue.toLocaleString()} ventas</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MostProfitableProductsCard;

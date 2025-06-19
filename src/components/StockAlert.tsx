import { AlertTriangle, Package } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/hooks/useProducts";

interface StockAlertProps {
  products: Product[];
}

const StockAlert = ({ products }: StockAlertProps) => {
  if (products.length === 0) return null;

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">¡Atención! Stock Bajo Detectado</AlertTitle>
      <AlertDescription className="text-red-700">
        <p className="mb-3">Los siguientes productos tienen stock bajo y necesitan reabastecimiento:</p>
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100">
              <div className="flex items-center space-x-3">
                <Package className="h-4 w-4 text-red-500" />
                <div>
                  <span className="font-medium text-gray-900">{product.name}</span>
                  <div className="text-sm text-gray-600">
                    Stock actual: {product.stock} | Mínimo: {product.minStock}
                  </div>
                </div>
              </div>
              <Badge variant="destructive">
                Faltan {Math.max(0, product.minStock - product.stock + 1)} unidades
              </Badge>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default StockAlert;

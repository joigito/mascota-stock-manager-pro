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
    <Alert className="border-destructive/50 bg-destructive/10">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <AlertTitle className="text-destructive dark:text-white">¡Atención! Stock Bajo Detectado</AlertTitle>
      <AlertDescription className="text-destructive/80 dark:text-white">
        <p className="mb-3">Los siguientes productos tienen stock bajo y necesitan reabastecimiento:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col bg-card rounded-lg p-3 border border-destructive/20">
              <div className="flex items-center space-x-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <span className="font-medium text-foreground block">{product.name}</span>
                  <div className="text-sm text-muted-foreground">
                    Stock actual: {product.stock} | Mínimo: {product.minStock}
                  </div>
                </div>
              </div>
              <Badge variant="destructive" className="self-start">
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

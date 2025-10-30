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
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between bg-card rounded-lg p-3 border border-destructive/20">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <span className="font-medium text-foreground">{product.name}</span>
                  <div className="text-sm text-muted-foreground">
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

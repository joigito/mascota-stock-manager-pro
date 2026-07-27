import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/hooks/useProducts";

interface StockAlertProps {
  products: Product[];
}

const StockAlert = ({ products }: StockAlertProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filter out variant products - they have stock=0 which would cause false alerts
  const normalProducts = products.filter(p => !p.hasVariants);
  
  if (normalProducts.length === 0) return null;

  const displayedProducts = isExpanded ? normalProducts : normalProducts.slice(0, 3);
  const hasMore = normalProducts.length > 3;

  return (
    <Alert className="border-destructive/50 bg-destructive/10">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <AlertTitle className="text-destructive dark:text-white">¡Atención! Stock Bajo Detectado</AlertTitle>
      <AlertDescription className="text-destructive/80 dark:text-white">
        <p className="mb-3">
          {normalProducts.length} {normalProducts.length === 1 ? 'producto tiene' : 'productos tienen'} stock bajo y {normalProducts.length === 1 ? 'necesita' : 'necesitan'} reabastecimiento:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedProducts.map((product) => (
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
        
        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Mostrar {normalProducts.length - 3} más
                </>
              )}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default StockAlert;

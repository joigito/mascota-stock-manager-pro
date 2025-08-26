import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, History, Minus } from 'lucide-react';
import { usePriceHistory } from '@/hooks/usePriceHistory';
import { Product } from '@/hooks/useProducts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PriceHistoryDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PriceHistoryDialog = ({ product, open, onOpenChange }: PriceHistoryDialogProps) => {
  const { priceHistory, loading, loadPriceHistory } = usePriceHistory();
  const [productHistory, setProductHistory] = useState<typeof priceHistory>([]);

  useEffect(() => {
    if (open && product) {
      loadPriceHistory(product.id);
    }
  }, [open, product]);

  useEffect(() => {
    if (product) {
      const filtered = priceHistory.filter(h => h.product_id === product.id);
      setProductHistory(filtered);
    }
  }, [priceHistory, product]);

  const getTrendIcon = (oldValue?: number, newValue?: number) => {
    if (!oldValue || !newValue) return <Minus className="h-4 w-4" />;
    if (newValue > oldValue) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (newValue < oldValue) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4" />;
  };

  const formatPrice = (price?: number) => {
    return price ? `$${price.toFixed(2)}` : '-';
  };

  const getPriceChange = (oldPrice?: number, newPrice?: number) => {
    if (!oldPrice || !newPrice) return null;
    
    const change = newPrice - oldPrice;
    const percentage = ((change / oldPrice) * 100).toFixed(1);
    const sign = change > 0 ? '+' : '';
    
    return {
      absolute: `${sign}$${change.toFixed(2)}`,
      percentage: `${sign}${percentage}%`,
      isPositive: change > 0
    };
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Precios - {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <span className="text-sm font-medium">Precio Actual de Costo:</span>
              <div className="text-lg font-semibold">${product.costPrice?.toFixed(2) || '0.00'}</div>
            </div>
            <div>
              <span className="text-sm font-medium">Precio Actual de Venta:</span>
              <div className="text-lg font-semibold">${product.price.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-sm font-medium">Margen Actual:</span>
              <div className="text-lg font-semibold">
                {product.costPrice 
                  ? `${(((product.price - product.costPrice) / product.price) * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">Total de Cambios:</span>
              <div className="text-lg font-semibold">{productHistory.length}</div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div>Cargando historial...</div>
            </div>
          ) : productHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay historial de precios para este producto</p>
              <p className="text-sm">Los cambios de precios se registrarán automáticamente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Precio de Costo</TableHead>
                    <TableHead>Precio de Venta</TableHead>
                    <TableHead>Cambios</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productHistory.map((entry) => {
                    const costChange = getPriceChange(entry.old_cost_price, entry.new_cost_price);
                    const sellingChange = getPriceChange(entry.old_selling_price, entry.new_selling_price);
                    
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: es })}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getTrendIcon(entry.old_cost_price, entry.new_cost_price)}
                              <span>{formatPrice(entry.old_cost_price)} → {formatPrice(entry.new_cost_price)}</span>
                            </div>
                            {costChange && (
                              <Badge variant={costChange.isPositive ? 'destructive' : 'default'} className="text-xs">
                                {costChange.absolute} ({costChange.percentage})
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getTrendIcon(entry.old_selling_price, entry.new_selling_price)}
                              <span>{formatPrice(entry.old_selling_price)} → {formatPrice(entry.new_selling_price)}</span>
                            </div>
                            {sellingChange && (
                              <Badge variant={sellingChange.isPositive ? 'default' : 'destructive'} className="text-xs">
                                {sellingChange.absolute} ({sellingChange.percentage})
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            {entry.new_cost_price && entry.old_cost_price && (
                              <div className="text-xs text-muted-foreground">
                                Costo: {entry.new_cost_price > entry.old_cost_price ? '↗️' : '↘️'}
                              </div>
                            )}
                            {entry.new_selling_price && entry.old_selling_price && (
                              <div className="text-xs text-muted-foreground">
                                Venta: {entry.new_selling_price > entry.old_selling_price ? '↗️' : '↘️'}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {entry.reason}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceHistoryDialog;
import { useState, useEffect } from 'react';
import { Plus, Minus, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SaleItem } from "@/types/sales";

interface SaleItemCardProps {
  item: SaleItem;
  onUpdateQuantity: (newQuantity: number) => void;
  onUpdatePrice: (newPrice: number) => void;
  onRemoveItem: () => void;
}

const SaleItemCard = ({ item, onUpdateQuantity, onUpdatePrice, onRemoveItem }: SaleItemCardProps) => {
  const [editablePrice, setEditablePrice] = useState(item.finalUnitPrice.toString());

  useEffect(() => {
    // Update local state if the prop changes from parent
    setEditablePrice(item.finalUnitPrice.toString());
  }, [item.finalUnitPrice]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditablePrice(e.target.value);
  };

  const handlePriceBlur = () => {
    const newPrice = parseFloat(editablePrice);
    if (!isNaN(newPrice) && newPrice !== item.finalUnitPrice) {
      onUpdatePrice(newPrice);
    } else {
      // If input is invalid or unchanged, reset to the value from props
      setEditablePrice(item.finalUnitPrice.toString());
    }
  };

  return (
    <div className="bg-muted/50 p-3 rounded-lg border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1">
          <span className="font-medium">{item.productName}</span>
          {item.variantInfo && (
            <div className="text-xs text-muted-foreground">{item.variantInfo}</div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Precio Unit:</span>
          <Input
            type="number"
            value={editablePrice}
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
            className="h-8 w-24 text-right"
            step="0.01"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onUpdateQuantity(item.quantity - 1)}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onUpdateQuantity(item.quantity + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="font-medium text-right w-full sm:w-auto">
          Subtotal: ${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </div>

        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={onRemoveItem}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-end items-center text-xs text-muted-foreground mt-2 pr-12">
        <span className="text-primary font-medium">
          Ganancia: ${item.profit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
        <Badge variant="secondary" className="ml-4">
          <TrendingUp className="h-3 w-3 mr-1" />
          {item.margin.toFixed(1)}% margen
        </Badge>
      </div>
    </div>
  );
};

export default SaleItemCard;
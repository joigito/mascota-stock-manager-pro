
import { Plus, Minus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  costPrice: number;
  subtotal: number;
  profit: number;
  margin: number;
}

interface SaleItemCardProps {
  item: SaleItem;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

const SaleItemCard = ({ item, onUpdateQuantity, onRemoveItem }: SaleItemCardProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <span className="font-medium">{item.productName}</span>
          <div className="text-sm text-gray-600">
            ${item.price} x {item.quantity} = ${item.subtotal.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRemoveItem(item.productId)}
          >
            Eliminar
          </Button>
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-green-600">
          Ganancia: ${item.profit.toLocaleString()}
        </span>
        <Badge variant="secondary" className="text-xs">
          <TrendingUp className="h-3 w-3 mr-1" />
          {item.margin.toFixed(1)}% margen
        </Badge>
      </div>
    </div>
  );
};

export default SaleItemCard;

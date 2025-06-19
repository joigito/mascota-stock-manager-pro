
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/hooks/useProducts";

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  quantity: number;
  onProductSelect: (productId: string) => void;
  onQuantityChange: (quantity: number) => void;
  onAddItem: () => void;
}

const ProductSelector = ({
  products,
  selectedProductId,
  quantity,
  onProductSelect,
  onQuantityChange,
  onAddItem
}: ProductSelectorProps) => {
  const availableProducts = products.filter(p => p.stock > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Producto</Label>
        <Select value={selectedProductId} onValueChange={onProductSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar producto" />
          </SelectTrigger>
          <SelectContent>
            {availableProducts.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} - Stock: {product.stock} - ${product.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Cantidad</Label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
        />
      </div>

      <div className="flex items-end">
        <Button onClick={onAddItem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>
    </div>
  );
};

export default ProductSelector;

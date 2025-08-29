
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/hooks/useProducts";
import { useProductSearch } from "@/hooks/useProductSearch";
import SearchInput from "@/components/ui/SearchInput";

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
  const { searchTerm, setSearchTerm, filteredProducts } = useProductSearch(availableProducts);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="space-y-2">
        <Label>Buscar Producto</Label>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre o código..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label>Producto</Label>
        <Select value={selectedProductId} onValueChange={onProductSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar producto" />
          </SelectTrigger>
            <SelectContent>
              {filteredProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start">
                      <span>{product.name}</span>
                      {product.baseSku && (
                        <span className="text-xs text-muted-foreground">SKU: {product.baseSku}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Stock: {product.stock}</span>
                      <span>${product.price}</span>
                    </div>
                  </div>
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
        <Button onClick={onAddItem} className="w-full" disabled={!selectedProductId}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>
    </div>
    </div>
  );
};

export default ProductSelector;

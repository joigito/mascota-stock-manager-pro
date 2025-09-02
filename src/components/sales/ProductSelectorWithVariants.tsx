import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/hooks/useProducts";
import { useProductSearch } from "@/hooks/useProductSearch";
import SearchInput from "@/components/ui/SearchInput";
import VariantSelector from "@/components/variants/VariantSelector";

interface ProductSelectorWithVariantsProps {
  products: Product[];
  selectedProductId: string;
  selectedVariantId?: string;
  quantity: number;
  finalPrice: number;
  onProductSelect: (productId: string) => void;
  onVariantSelect: (variantId: string | null, price: number) => void;
  onQuantityChange: (quantity: number) => void;
  onAddItem: () => void;
}

const ProductSelectorWithVariants = ({
  products,
  selectedProductId,
  selectedVariantId,
  quantity,
  finalPrice,
  onProductSelect,
  onVariantSelect,
  onQuantityChange,
  onAddItem
}: ProductSelectorWithVariantsProps) => {
  const availableProducts = products.filter(p => {
    if (p.hasVariants) {
      // For variant products, we'll check stock at variant level
      return true;
    } else {
      // For simple products, check stock directly
      return p.stock > 0;
    }
  });
  const { searchTerm, setSearchTerm, filteredProducts } = useProductSearch(availableProducts);
  const selectedProduct = products.find(p => p.id === selectedProductId);

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
          <Select key={`product-select-${searchTerm}`} value={selectedProductId} onValueChange={onProductSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar producto" />
            </SelectTrigger>
            <SelectContent>
              {(() => {
                console.log("🔍 Rendering SelectContent with products:", filteredProducts.map(p => p.name));
                return filteredProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start">
                      <span>{product.name}</span>
                      {product.baseSku && (
                        <span className="text-xs text-muted-foreground">SKU: {product.baseSku}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {product.hasVariants ? (
                        <span>Con variantes</span>
                      ) : (
                        <>
                          <span>Stock: {product.stock}</span>
                          <span>${product.price}</span>
                        </>
                      )}
                    </div>
                  </div>
                </SelectItem>
                ));
              })()}
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

      {/* Show variant selector if product has variants */}
      {selectedProduct && selectedProduct.hasVariants && (
        <div className="border-t pt-4">
          <VariantSelector
            productId={selectedProduct.id}
            productName={selectedProduct.name}
            basePrice={selectedProduct.price}
            onVariantSelect={(variant, price) => {
              onVariantSelect(variant?.id || null, price);
            }}
            selectedVariantId={selectedVariantId}
          />
        </div>
      )}

      {/* Show final price */}
      {selectedProduct && finalPrice > 0 && (
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Precio final por unidad:</div>
          <div className="text-lg font-semibold">${finalPrice.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};

export default ProductSelectorWithVariants;
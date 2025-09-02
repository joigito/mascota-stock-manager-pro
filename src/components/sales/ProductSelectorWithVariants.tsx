import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  const { searchTerm, setSearchTerm, filteredProducts, hasSearchTerm } = useProductSearch(availableProducts);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

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

      {/* Product Grid */}
      <div className="space-y-4">
        <Label>Seleccionar Producto</Label>

        {filteredProducts.length === 0 ? (
          <div className="p-6 text-center border rounded-lg bg-muted/50">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {hasSearchTerm ? `No se encontraron productos para "${searchTerm}"` : "No hay productos disponibles"}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
            <div className="divide-y">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onProductSelect(product.id)}
                  className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                    selectedProductId === product.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium truncate">{product.name}</h4>
                        {product.hasVariants && (
                          <Badge variant="secondary" className="text-xs">Variantes</Badge>
                        )}
                      </div>
                      {product.baseSku && (
                        <p className="text-xs text-muted-foreground">SKU: {product.baseSku}</p>
                      )}
                    </div>
                    <div className="text-right text-xs space-y-1">
                      <div className="font-medium">{formatCurrency(product.price)}</div>
                      {!product.hasVariants && (
                        <div className="text-muted-foreground">Stock: {product.stock}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quantity and Add Button */}
      <div className="grid grid-cols-2 gap-4">
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
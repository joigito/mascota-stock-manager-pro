import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useProductVariants, ProductVariant } from "@/hooks/useProductVariants";

interface VariantSelectorProps {
  productId: string;
  productName: string;
  basePrice: number;
  onVariantSelect: (variant: ProductVariant | null, finalPrice: number) => void;
  selectedVariantId?: string;
}

const VariantSelector = ({ 
  productId, 
  productName, 
  basePrice, 
  onVariantSelect, 
  selectedVariantId 
}: VariantSelectorProps) => {
  const { variants, loading } = useProductVariants(productId);
  const [selectedId, setSelectedId] = useState<string>(selectedVariantId || "");

  useEffect(() => {
    // Keep local selected id in sync with prop
    if (selectedVariantId) {
      const variant = variants.find(v => v.id === selectedVariantId);
      if (variant) {
        setSelectedId(variant.id);
      }
    }
  }, [selectedVariantId, variants]);

  const availableVariants = variants.filter(v => v.is_active && v.stock > 0);

  const handleVariantChange = (value: string) => {
    setSelectedId(value);

    if (!value) {
      onVariantSelect(null, basePrice);
      return;
    }

    const variant = variants.find(v => v.id === value);

    if (variant) {
      const finalPrice = basePrice + variant.price_adjustment;
      onVariantSelect(variant, finalPrice);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando variantes...</div>;
  }

  if (availableVariants.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No hay variantes disponibles
      </div>
    );
  }

  const selectedVariant = variants.find(v => v.id === selectedId);

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">{productName}</Label>
        <div className="text-xs text-muted-foreground">
          Selecciona color y talle
        </div>
      </div>
      
      <Select value={selectedId} onValueChange={handleVariantChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar variante" />
        </SelectTrigger>
        <SelectContent>
          {availableVariants.map((variant) => {
            const finalPrice = basePrice + variant.price_adjustment;
            
            return (
              <SelectItem key={variant.id} value={variant.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {variant.color && (
                      <Badge variant="secondary" className="text-xs">
                        {variant.color}
                      </Badge>
                    )}
                    {variant.size && (
                      <Badge variant="outline" className="text-xs">
                        {variant.size}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span>Stock: {variant.stock}</span>
                    {variant.price_adjustment !== 0 && (
                      <span className="font-medium">
                        ${finalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selectedVariant && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Stock disponible:</span>
            <Badge variant={selectedVariant.stock <= selectedVariant.min_stock ? "destructive" : "secondary"}>
              {selectedVariant.stock}
            </Badge>
          </div>
          {selectedVariant.price_adjustment !== 0 && (
            <div className="text-right">
              <div className="text-muted-foreground">Precio final:</div>
              <div className="font-medium">
                ${(basePrice + selectedVariant.price_adjustment).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
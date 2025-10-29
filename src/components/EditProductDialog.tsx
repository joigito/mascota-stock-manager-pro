
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/hooks/useProducts";
import { useToast } from "@/components/ui/use-toast";
import { useCustomCategories } from "@/hooks/useCustomCategories";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { Button as HistoryButton } from "@/components/ui/button";
import { History } from "lucide-react";
import PriceHistoryDialog from "@/components/PriceHistoryDialog";
import { useVariantAttributes } from "@/hooks/useVariantAttributes";
import { useOrganization } from "@/hooks/useOrganization";
import { Badge } from "@/components/ui/badge";

interface EditProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProduct: (product: Partial<Product>) => void;
}

const EditProductDialog = ({ product, open, onOpenChange, onUpdateProduct }: EditProductDialogProps) => {
  const { toast } = useToast();
  const { categories } = useCustomCategories();
  const { recordPriceChange } = usePriceHistory();
  const { currentOrganization } = useOrganization();
  const { attributes } = useVariantAttributes(currentOrganization?.id);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    minStock: "",
    price: "",
    costPrice: "",
    description: ""
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        price: product.price.toString(),
        costPrice: (product.costPrice || product.price * 0.7).toString(),
        description: product.description || ""
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.stock || !formData.minStock || !formData.price || !formData.costPrice) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    const costPrice = parseFloat(formData.costPrice);

    if (costPrice >= price) {
      toast({
        title: "Error",
        description: "El precio de costo debe ser menor al precio de venta",
        variant: "destructive",
      });
      return;
    }

    // Registrar cambios de precios si hay diferencias
    const oldCostPrice = product.costPrice;
    const oldSellingPrice = product.price;
    
    if (oldCostPrice !== costPrice || oldSellingPrice !== price) {
      await recordPriceChange(
        product.id,
        oldCostPrice,
        costPrice,
        oldSellingPrice,
        price,
        "Actualización manual del producto"
      );
    }

    onUpdateProduct({
      name: formData.name,
      category: formData.category as any,
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      price: price,
      costPrice: costPrice,
      description: formData.description || undefined
    });

    const margin = ((price - costPrice) / price * 100).toFixed(1);
    toast({
      title: "Producto actualizado",
      description: `Producto actualizado con margen de ganancia del ${margin}%`,
    });

    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateMargin = () => {
    const price = parseFloat(formData.price);
    const costPrice = parseFloat(formData.costPrice);
    if (price > 0 && costPrice > 0 && costPrice < price) {
      return ((price - costPrice) / price * 100).toFixed(1);
    }
    return "0";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>
                Modifica la información del producto.
              </DialogDescription>
            </div>
            <HistoryButton
              variant="outline"
              size="sm"
              onClick={() => setShowPriceHistory(true)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Historial
            </HistoryButton>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre del Producto</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Alimento Premium para Perros"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoría</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No hay categorías disponibles.
                    <br />
                    <span className="text-xs">
                      Primero selecciona una organización, luego ve a Configuración → Mis Categorías para crear categorías.
                    </span>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock Actual</Label>
              <Input
                id="edit-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="0"
                min="0"
                required
                disabled={product.hasVariants}
              />
              {product.hasVariants && (
                <p className="text-xs text-muted-foreground">
                  El stock se maneja por variantes
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-minStock">Stock Mínimo</Label>
              <Input
                id="edit-minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => handleInputChange("minStock", e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-costPrice">Precio de Costo (COP)</Label>
              <Input
                id="edit-costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => handleInputChange("costPrice", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio de Venta (COP)</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {formData.price && formData.costPrice && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Margen de ganancia: {calculateMargin()}%</strong>
              </div>
              <div className="text-xs text-green-600 mt-1">
                Ganancia por unidad: ${(parseFloat(formData.price) - parseFloat(formData.costPrice)).toLocaleString()}
              </div>
            </div>
          )}

          {product.hasVariants && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Producto con variantes</strong>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Este producto tiene variantes. Usa el gestor de variantes en la lista de productos para administrarlas.
              </div>
              {attributes.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-blue-700 font-medium mb-1">Atributos disponibles:</div>
                  <div className="flex flex-wrap gap-1">
                    {attributes.map(attr => (
                      <Badge key={attr.id} variant="secondary" className="text-xs">
                        {attr.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción (Opcional)</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descripción del producto..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      <PriceHistoryDialog 
        product={product}
        open={showPriceHistory}
        onOpenChange={setShowPriceHistory}
      />
    </Dialog>
  );
};

export default EditProductDialog;

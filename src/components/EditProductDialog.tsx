
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
import { useSystemConfiguration } from "@/hooks/useSystemConfiguration";

interface EditProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProduct: (product: Partial<Product>) => void;
}

const EditProductDialog = ({ product, open, onOpenChange, onUpdateProduct }: EditProductDialogProps) => {
  const { toast } = useToast();
  const { getAvailableCategoriesForSelect } = useSystemConfiguration();
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

  const handleSubmit = (e: React.FormEvent) => {
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
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modifica la información del producto.
          </DialogDescription>
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
                {getAvailableCategoriesForSelect().map((category) => (
                  <SelectItem key={category.key} value={category.key}>
                    {category.label}
                  </SelectItem>
                ))}
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
              />
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
    </Dialog>
  );
};

export default EditProductDialog;

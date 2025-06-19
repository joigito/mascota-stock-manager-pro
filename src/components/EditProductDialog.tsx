
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
import { Product } from "@/pages/Index";

interface EditProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProduct: (product: Partial<Product>) => void;
}

const EditProductDialog = ({ product, open, onOpenChange, onUpdateProduct }: EditProductDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "mascotas" as "mascotas" | "forrajeria",
    stock: "",
    minStock: "",
    price: "",
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
        description: product.description || ""
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.stock || !formData.minStock || !formData.price) {
      return;
    }

    onUpdateProduct({
      name: formData.name,
      category: formData.category,
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      price: parseFloat(formData.price),
      description: formData.description || undefined
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
            <Select value={formData.category} onValueChange={(value: "mascotas" | "forrajeria") => handleInputChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mascotas">Mascotas</SelectItem>
                <SelectItem value="forrajeria">Forrajería</SelectItem>
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

          <div className="space-y-2">
            <Label htmlFor="edit-price">Precio (COP)</Label>
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

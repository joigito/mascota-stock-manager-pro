import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Product } from "@/hooks/useProducts";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AuthPrompt } from "@/components/AuthPrompt";
import { useCustomCategories } from "@/hooks/useCustomCategories";
import { useVariantAttributes } from "@/hooks/useVariantAttributes";
import { useOrganization } from "@/hooks/useOrganization";
import { Badge } from "@/components/ui/badge";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Omit<Product, "id" | "created_at" | "updated_at" | "organization_id">) => Promise<{ error: any }>;
  storeName?: string;
}

const AddProductDialog = ({ open, onOpenChange, onAddProduct, storeName }: AddProductDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { categories } = useCustomCategories();
  const { currentOrganization } = useOrganization();
  const { attributes } = useVariantAttributes(currentOrganization?.id);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    minStock: "",
    price: "",
    costPrice: "",
    description: "",
    hasVariants: false,
    baseSku: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || (!formData.hasVariants && !formData.stock) || !formData.minStock || !formData.price || !formData.costPrice) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Validation
    const stock = formData.hasVariants ? 0 : parseInt(formData.stock);
    const minStock = parseInt(formData.minStock);
    const price = parseFloat(formData.price);
    const costPrice = parseFloat(formData.costPrice);

    if ((!formData.hasVariants && stock < 0) || minStock < 0 || price < 0 || costPrice < 0) {
      toast({
        title: "Error",
        description: "Los valores no pueden ser negativos",
        variant: "destructive",
      });
      return;
    }

    if (costPrice >= price) {
      toast({
        title: "Error",
        description: "El precio de costo debe ser menor al precio de venta",
        variant: "destructive",
      });
      return;
    }

    if (formData.name.length > 200 || (formData.description && formData.description.length > 1000)) {
      toast({
        title: "Error",
        description: "El nombre es muy largo o la descripción excede los 1000 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await onAddProduct({
        name: formData.name.trim(),
        category: formData.category as any,
        stock: formData.hasVariants ? 0 : stock,
        minStock,
        price,
        costPrice,
        description: formData.description.trim() || undefined,
        hasVariants: formData.hasVariants,
        baseSku: formData.baseSku.trim() || undefined
      });

      if (result.error === null) {
        const margin = ((price - costPrice) / price * 100).toFixed(1);
        toast({
          title: "Producto agregado",
          description: `Producto agregado con margen de ganancia del ${margin}%`,
        });
        
        // Reset form
        setFormData({
          name: "",
          category: "",
          stock: "",
          minStock: "",
          price: "",
          costPrice: "",
          description: "",
          hasVariants: false,
          baseSku: ""
        });
        
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  // Show auth prompt if user is not authenticated
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Acceso Requerido</DialogTitle>
          </DialogHeader>
          <AuthPrompt 
            storeName={storeName}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
          <DialogDescription>
            Completa la información del producto para agregarlo al inventario.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 pr-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Alimento Premium para Perros"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
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
              <Label htmlFor="stock">Stock Actual</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="0"
                min="0"
                max="1000000"
                required={!formData.hasVariants}
                disabled={formData.hasVariants}
              />
              {formData.hasVariants && (
                <p className="text-xs text-muted-foreground">
                  El stock se manejará por variantes
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => handleInputChange("minStock", e.target.value)}
                placeholder="0"
                min="0"
                max="1000000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseSku">SKU Base (opcional)</Label>
              <Input
                id="baseSku"
                value={formData.baseSku}
                onChange={(e) => handleInputChange("baseSku", e.target.value)}
                placeholder="Ej: NIKE-AIR-MAX"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="hasVariants"
                  checked={formData.hasVariants}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasVariants: checked }))
                  }
                />
                <Label htmlFor="hasVariants">Producto con variantes</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.hasVariants 
                  ? "Podrás agregar colores, talles después"
                  : "Producto simple sin variantes"
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Precio de Costo (COP)</Label>
              <Input
                id="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => handleInputChange("costPrice", e.target.value)}
                placeholder="0"
                min="0"
                max="1000000"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio de Venta (COP)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0"
                min="0"
                max="1000000"
                step="0.01"
                required
              />
            </div>
          </div>

          {formData.price && formData.costPrice && !formData.hasVariants && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Margen de ganancia: {calculateMargin()}%</strong>
              </div>
              <div className="text-xs text-green-600 mt-1">
                Ganancia por unidad: ${(parseFloat(formData.price) - parseFloat(formData.costPrice)).toLocaleString()}
              </div>
            </div>
          )}

          {formData.hasVariants && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Producto con variantes</strong>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Después de crear el producto podrás agregar variantes específicas y configurar stock para cada una.
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
              {attributes.length === 0 && (
                <div className="mt-2 text-xs text-blue-600">
                  <strong>Nota:</strong> No hay atributos de variante configurados. Ve a Panel de Administrador → Accesos Rápidos → Gestionar Variantes para crear atributos como Color, Talle, etc.
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descripción del producto..."
              maxLength={1000}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar Producto'}
            </Button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
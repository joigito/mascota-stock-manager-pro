import { useState } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProductVariants, ProductVariant } from "@/hooks/useProductVariants";
import { toast } from "sonner";

interface ProductVariantManagerProps {
  productId: string;
  productName: string;
  hasVariants: boolean;
  onVariantsChange?: () => void;
}

const ProductVariantManager = ({ 
  productId, 
  productName, 
  hasVariants,
  onVariantsChange 
}: ProductVariantManagerProps) => {
  const { variants, loading, addVariant, updateVariant, deleteVariant, getTotalStock } = useProductVariants(productId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formData, setFormData] = useState({
    sku: "",
    color: "",
    size: "",
    stock: 0,
    min_stock: 0,
    price_adjustment: 0
  });

  const resetForm = () => {
    setFormData({
      sku: "",
      color: "",
      size: "",
      stock: 0,
      min_stock: 0,
      price_adjustment: 0
    });
  };

  const handleAdd = async () => {
    try {
      await addVariant({
        product_id: productId,
        is_active: true,
        ...formData
      });
      setIsAddDialogOpen(false);
      resetForm();
      onVariantsChange?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEdit = async () => {
    if (!editingVariant) return;
    
    try {
      await updateVariant(editingVariant.id, formData);
      setEditingVariant(null);
      resetForm();
      onVariantsChange?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (variantId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta variante?")) {
      try {
        await deleteVariant(variantId);
        onVariantsChange?.();
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const openEditDialog = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      sku: variant.sku || "",
      color: variant.color || "",
      size: variant.size || "",
      stock: variant.stock,
      min_stock: variant.min_stock,
      price_adjustment: variant.price_adjustment
    });
  };

  if (!hasVariants) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Variantes de {productName}
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Variante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Variante</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="SKU específico"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Ej: Rojo, Azul, Negro"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Talle/Tamaño</Label>
                  <Input
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="Ej: M, 42, XL"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock Mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.min_stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_stock: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ajuste de Precio ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_adjustment}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) || 0 }))}
                    placeholder="0 = precio base"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAdd}>
                  Agregar Variante
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando variantes...</div>
        ) : variants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay variantes configuradas
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {variants.length} variantes • Stock total: {getTotalStock()}
              </span>
            </div>
            <div className="grid gap-2">
              {variants.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {variant.color && (
                          <Badge variant="secondary">{variant.color}</Badge>
                        )}
                        {variant.size && (
                          <Badge variant="outline">{variant.size}</Badge>
                        )}
                        {variant.sku && (
                          <Badge variant="secondary">{variant.sku}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Stock: {variant.stock} 
                        {variant.price_adjustment !== 0 && (
                          <span className="ml-2">
                            Ajuste: ${variant.price_adjustment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(variant)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingVariant} onOpenChange={(open) => !open && setEditingVariant(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Variante</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Talle/Tamaño</Label>
                  <Input
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock Mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.min_stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_stock: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ajuste de Precio ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_adjustment}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingVariant(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleEdit}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProductVariantManager;
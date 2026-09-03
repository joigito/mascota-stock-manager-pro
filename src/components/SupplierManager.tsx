import { useState } from "react";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSuppliers } from "@/hooks/useSuppliers";

interface SupplierManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupplierManager = ({ open, onOpenChange }: SupplierManagerProps) => {
  const { toast } = useToast();
  const { suppliers, createSupplier, updateSupplier, deleteSupplier, loading } = useSuppliers();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<{ id: string; name: string; description?: string; contact_info?: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactInfo: "",
  });

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del proveedor es requerido",
        variant: "destructive",
      });
      return;
    }

    await createSupplier(formData.name.trim(), formData.description.trim() || undefined, formData.contactInfo.trim() || undefined);
    setFormData({ name: "", description: "", contactInfo: "" });
    setIsAddDialogOpen(false);
  };

  const handleEdit = async () => {
    if (!editingSupplier || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del proveedor es requerido",
        variant: "destructive",
      });
      return;
    }

    await updateSupplier(editingSupplier.id, formData.name.trim(), formData.description.trim() || undefined, formData.contactInfo.trim() || undefined);
    setFormData({ name: "", description: "", contactInfo: "" });
    setEditingSupplier(null);
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    await deleteSupplier(supplierToDelete);
    setSupplierToDelete(null);
  };

  const openEditDialog = (supplier: { id: string; name: string; description?: string | null; contact_info?: string | null }) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      description: supplier.description || "",
      contactInfo: supplier.contact_info || "",
    });
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestión de Proveedores</DialogTitle>
            <DialogDescription>
              Administra los proveedores de tu organización
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </Button>
            
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando proveedores...
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay proveedores creados</p>
                <p className="text-sm">Crea tu primer proveedor para comenzar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{supplier.name}</div>
                      {supplier.description && (
                        <div className="text-sm text-muted-foreground">{supplier.description}</div>
                      )}
                      {supplier.contact_info && (
                        <div className="text-sm text-muted-foreground">{supplier.contact_info}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(supplier)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSupplierToDelete(supplier.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Proveedor</DialogTitle>
            <DialogDescription>
              Crea un nuevo proveedor para tus compras
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nombre</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Distribuidora Mayorista"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-contact">Contacto (opcional)</Label>
              <Input
                id="add-contact"
                value={formData.contactInfo}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactInfo: e.target.value }))}
                placeholder="Teléfono, email, persona de contacto..."
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-description">Descripción (opcional)</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Notas sobre el proveedor"
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd}>Crear Proveedor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Proveedor</DialogTitle>
            <DialogDescription>
              Modifica la información del proveedor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Distribuidora Mayorista"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact">Contacto (opcional)</Label>
              <Input
                id="edit-contact"
                value={formData.contactInfo}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactInfo: e.target.value }))}
                placeholder="Teléfono, email, persona de contacto..."
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción (opcional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Notas sobre el proveedor"
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!supplierToDelete} onOpenChange={() => setSupplierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los productos asociados a este proveedor no se eliminarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

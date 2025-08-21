import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomCategories } from '@/hooks/useCustomCategories';
import { useOrganization } from '@/hooks/useOrganization';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryFormData {
  name: string;
  description: string;
}

const CustomCategoryManager: React.FC = () => {
  const { categories, loading, createCategory, updateCategory, deleteCategory, migrateExistingCategories } = useCustomCategories();
  const { currentOrganization } = useOrganization();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    const success = await createCategory(formData.name, formData.description);
    if (success) {
      setFormData({ name: '', description: '' });
      setIsCreateDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleEdit = async (id: string) => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    const success = await updateCategory(id, formData.name, formData.description);
    if (success) {
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
  };

  const openEditDialog = (category: any) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingCategory(category.id);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Selecciona una organización</h3>
          <p className="text-muted-foreground">
            Para gestionar categorías personalizadas, primero debes seleccionar una organización específica.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Categorías Personalizadas</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona las categorías específicas para tu negocio
          </p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <Button
              onClick={migrateExistingCategories}
              variant="outline"
              size="sm"
            >
              Migrar Categorías Existentes
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Categoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Nombre de la Categoría</Label>
                  <Input
                    id="category-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej: Ropa Femenina, Pelotas, Accesorios..."
                  />
                </div>
                <div>
                  <Label htmlFor="category-description">Descripción (Opcional)</Label>
                  <Textarea
                    id="category-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción de la categoría..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!formData.name.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Creando...' : 'Crear Categoría'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay categorías personalizadas</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera categoría personalizada para organizar mejor tus productos
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Categoría
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <Badge variant="secondary">Activa</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={editingCategory === category.id} onOpenChange={(open) => {
                      if (!open) resetForm();
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Categoría</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-category-name">Nombre de la Categoría</Label>
                            <Input
                              id="edit-category-name"
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Nombre de la categoría..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-category-description">Descripción (Opcional)</Label>
                            <Textarea
                              id="edit-category-description"
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Descripción de la categoría..."
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={resetForm}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => handleEdit(category.id)}
                              disabled={!formData.name.trim() || isSubmitting}
                            >
                              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. La categoría "{category.name}" será eliminada permanentemente.
                            {category.description && (
                              <span className="block mt-2 text-sm">
                                Solo se puede eliminar si no tiene productos asignados.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomCategoryManager;
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package, Plus } from 'lucide-react';
import { useBatches, ProductBatch } from '@/hooks/useBatches';
import { Product } from '@/hooks/useProducts';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface BatchManagementProps {
  product: Product;
}

const BatchManagement = ({ product }: BatchManagementProps) => {
  const { batches, loading, addBatch, deleteBatch, loadBatches } = useBatches();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    purchase_price: '',
    quantity_purchased: '',
    supplier: '',
    notes: '',
    batch_date: new Date().toISOString().split('T')[0]
  });

  const productBatches = batches.filter(batch => batch.product_id === product.id);
  const totalAvailableStock = productBatches.reduce((sum, batch) => sum + batch.quantity_remaining, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const purchase_price = parseFloat(formData.purchase_price);
    const quantity_purchased = parseInt(formData.quantity_purchased);
    
    if (purchase_price <= 0) {
      toast.error('El precio de compra debe ser mayor a 0');
      return;
    }
    
    if (quantity_purchased <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const success = await addBatch({
      product_id: product.id,
      purchase_price,
      quantity_purchased,
      quantity_remaining: quantity_purchased,
      supplier: formData.supplier || undefined,
      notes: formData.notes || undefined,
      batch_date: formData.batch_date
    });

    if (success) {
      setFormData({
        purchase_price: '',
        quantity_purchased: '',
        supplier: '',
        notes: '',
        batch_date: new Date().toISOString().split('T')[0]
      });
      setIsDialogOpen(false);
      await loadBatches(product.id);
    }
  };

  const handleDelete = async (batchId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este lote?')) {
      const success = await deleteBatch(batchId);
      if (success) {
        await loadBatches(product.id);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestión de Lotes - {product.name}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Lote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Lote</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchase_price">Precio de Compra</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      step="0.01"
                      value={formData.purchase_price}
                      onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity_purchased">Cantidad</Label>
                    <Input
                      id="quantity_purchased"
                      type="number"
                      value={formData.quantity_purchased}
                      onChange={(e) => handleInputChange('quantity_purchased', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch_date">Fecha del Lote</Label>
                    <Input
                      id="batch_date"
                      type="date"
                      value={formData.batch_date}
                      onChange={(e) => handleInputChange('batch_date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Proveedor (opcional)</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Agregar Lote</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Stock Total:</span> {product.stock}
            </div>
            <div>
              <span className="font-medium">Stock en Lotes:</span> {totalAvailableStock}
            </div>
            <div>
              <span className="font-medium">Diferencia:</span>{' '}
              <Badge variant={product.stock === totalAvailableStock ? 'default' : 'destructive'}>
                {product.stock - totalAvailableStock}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Lotes Activos:</span> {productBatches.filter(b => b.quantity_remaining > 0).length}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Cargando lotes...</div>
          ) : productBatches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay lotes registrados para este producto</p>
              <p className="text-sm">Agrega un lote para comenzar con el control de inventario FIFO</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Precio Compra</TableHead>
                    <TableHead>Cant. Inicial</TableHead>
                    <TableHead>Disponible</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(batch.batch_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(batch.created_at), { addSuffix: true, locale: es })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>${batch.purchase_price.toFixed(2)}</TableCell>
                      <TableCell>{batch.quantity_purchased}</TableCell>
                      <TableCell>
                        <Badge variant={batch.quantity_remaining > 0 ? 'default' : 'secondary'}>
                          {batch.quantity_remaining}
                        </Badge>
                      </TableCell>
                      <TableCell>{batch.supplier || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={batch.quantity_remaining > 0 ? 'default' : 'outline'}>
                          {batch.quantity_remaining > 0 ? 'Activo' : 'Agotado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(batch.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchManagement;
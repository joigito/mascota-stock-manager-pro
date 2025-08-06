import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Save, AlertTriangle } from 'lucide-react';
import { useSystemConfiguration, CategoryMinStock } from '@/hooks/useSystemConfiguration';

// Categorías con sus labels para mostrar
const CATEGORY_LABELS: Record<string, string> = {
  mascotas: 'Mascotas',
  forrajeria: 'Forrajería',
  electronica: 'Electrónica',
  ropa: 'Ropa y Textiles',
  hogar: 'Hogar y Decoración',
  alimentacion: 'Alimentación',
  salud: 'Salud y Belleza',
  deportes: 'Deportes',
  libros: 'Libros y Papelería',
  vehiculos: 'Vehículos y Repuestos',
  servicios: 'Servicios',
  otros: 'Otros'
};

export const StockConfiguration: React.FC = () => {
  const { getCategoryMinStock, updateConfiguration, loading } = useSystemConfiguration();
  const [minStockValues, setMinStockValues] = useState<CategoryMinStock>(getCategoryMinStock());
  const [isModified, setIsModified] = useState(false);

  const handleStockChange = (category: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setMinStockValues(prev => ({
      ...prev,
      [category]: numValue
    }));
    setIsModified(true);
  };

  const saveChanges = async () => {
    await updateConfiguration('stock_settings', 'category_min_stock', minStockValues);
    setIsModified(false);
  };

  const resetChanges = () => {
    setMinStockValues(getCategoryMinStock());
    setIsModified(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Stock Mínimo por Categoría</span>
          </CardTitle>
          <CardDescription>
            Define los niveles mínimos de stock recomendados para cada categoría de productos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
              <div key={category} className="space-y-2">
                <Label htmlFor={`stock-${category}`} className="text-sm font-medium">
                  {label}
                </Label>
                <Input
                  id={`stock-${category}`}
                  type="number"
                  min="0"
                  value={minStockValues[category] || 0}
                  onChange={(e) => handleStockChange(category, e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {isModified && (
            <div className="flex space-x-2 pt-4 border-t">
              <Button onClick={saveChanges} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
              <Button variant="outline" onClick={resetChanges}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>¿Cómo funcionan las alertas de stock?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Sistema de Alertas Inteligente
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <strong>Stock por debajo del mínimo:</strong> Se muestra una alerta roja en el producto</li>
              <li>• <strong>Stock cerca del mínimo:</strong> Se muestra una advertencia amarilla (10% por encima)</li>
              <li>• <strong>Reportes automáticos:</strong> Los productos con stock bajo aparecen en el dashboard</li>
              <li>• <strong>Configuración flexible:</strong> Cada categoría puede tener su propio umbral</li>
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Recomendaciones por Rubro</h4>
              <div className="text-sm space-y-1">
                <div><strong>Perecederos:</strong> 15-20 unidades (alta rotación)</div>
                <div><strong>Electrónica:</strong> 2-5 unidades (alto valor, baja rotación)</div>
                <div><strong>Servicios:</strong> 0 unidades (no aplica stock físico)</div>
                <div><strong>Consumibles:</strong> 10-25 unidades (rotación media)</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Factores a Considerar</h4>
              <div className="text-sm space-y-1">
                <div>• Tiempo de reposición del proveedor</div>
                <div>• Velocidad de venta promedio</div>
                <div>• Costo de almacenamiento</div>
                <div>• Productos estacionales</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
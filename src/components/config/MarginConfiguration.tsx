import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, Save, Calculator, DollarSign } from 'lucide-react';
import { useSystemConfiguration, CategoryMargins } from '@/hooks/useSystemConfiguration';

// Categorías con sus labels para mostrar
const CATEGORY_LABELS: Record<string, string> = {
  mascotas: 'Mascotas',
  forrajeria: 'Alimentos',
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

export const MarginConfiguration: React.FC = () => {
  const { getCategoryMargins, updateConfiguration, loading } = useSystemConfiguration();
  const [marginValues, setMarginValues] = useState<CategoryMargins>(getCategoryMargins());
  const [isModified, setIsModified] = useState(false);

  const handleMarginChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setMarginValues(prev => ({
      ...prev,
      [category]: numValue
    }));
    setIsModified(true);
  };

  const saveChanges = async () => {
    await updateConfiguration('margin_settings', 'category_margins', marginValues);
    setIsModified(false);
  };

  const resetChanges = () => {
    setMarginValues(getCategoryMargins());
    setIsModified(false);
  };

  const calculatePrice = (cost: number, margin: number): number => {
    return cost * (1 + margin / 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Márgenes de Ganancia por Categoría</span>
          </CardTitle>
          <CardDescription>
            Define los márgenes de ganancia sugeridos para cada categoría de productos (en porcentaje)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
              <div key={category} className="space-y-2">
                <Label htmlFor={`margin-${category}`} className="text-sm font-medium">
                  {label}
                </Label>
                <div className="relative">
                  <Input
                    id={`margin-${category}`}
                    type="number"
                    min="0"
                    max="200"
                    step="0.5"
                    value={marginValues[category] || 0}
                    onChange={(e) => handleMarginChange(category, e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
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
            <Calculator className="h-5 w-5 text-green-500" />
            <span>Calculadora de Precios</span>
          </CardTitle>
          <CardDescription>
            Ejemplo de cómo los márgenes afectan el precio final
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">
              Ejemplo con costo de $100:
            </h4>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
              {Object.entries(marginValues).slice(0, 6).map(([category, margin]) => (
                <div key={category} className="flex justify-between p-2 bg-white dark:bg-green-900/20 rounded">
                  <span className="text-green-800 dark:text-green-200">
                    {CATEGORY_LABELS[category]}:
                  </span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    ${calculatePrice(100, margin).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <span>Guía de Márgenes por Industria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Márgenes Bajos (10-25%)</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>• Alimentación y bebidas</div>
                <div>• Alimentos y productos básicos</div>
                <div>• Vehículos y maquinaria</div>
                <div>• Productos de alta rotación</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Márgenes Medios (25-40%)</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>• Electrónica y tecnología</div>
                <div>• Hogar y decoración</div>
                <div>• Mascotas y accesorios</div>
                <div>• Deportes y fitness</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Márgenes Altos (40-60%+)</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>• Ropa y accesorios</div>
                <div>• Libros y papelería</div>
                <div>• Productos de lujo</div>
                <div>• Servicios profesionales</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Factores a Considerar</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>• Competencia en el mercado</div>
                <div>• Valor percibido del producto</div>
                <div>• Costos operativos</div>
                <div>• Velocidad de rotación</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
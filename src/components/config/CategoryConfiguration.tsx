import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Info } from 'lucide-react';

// Categorías disponibles del enum expandido
const AVAILABLE_CATEGORIES = [
  { key: 'mascotas', label: 'Mascotas', description: 'Alimentos y accesorios para mascotas' },
  { key: 'forrajeria', label: 'Forrajería', description: 'Alimentos y suplementos para ganado' },
  { key: 'electronica', label: 'Electrónica', description: 'Dispositivos y componentes electrónicos' },
  { key: 'ropa', label: 'Ropa y Textiles', description: 'Vestimenta y productos textiles' },
  { key: 'hogar', label: 'Hogar y Decoración', description: 'Artículos para el hogar' },
  { key: 'alimentacion', label: 'Alimentación', description: 'Alimentos y bebidas' },
  { key: 'salud', label: 'Salud y Belleza', description: 'Productos farmacéuticos y cosméticos' },
  { key: 'deportes', label: 'Deportes', description: 'Equipamiento deportivo y fitness' },
  { key: 'libros', label: 'Libros y Papelería', description: 'Literatura y artículos de oficina' },
  { key: 'vehiculos', label: 'Vehículos y Repuestos', description: 'Automóviles y componentes' },
  { key: 'servicios', label: 'Servicios', description: 'Servicios profesionales' },
  { key: 'otros', label: 'Otros', description: 'Productos no clasificados' }
];

export const CategoryConfiguration: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Categorías de Productos</span>
          </CardTitle>
          <CardDescription>
            Categorías predefinidas disponibles para organizar tus productos por rubro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_CATEGORIES.map((category) => (
              <Card key={category.key} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{category.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {category.key}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-500" />
            <span>Información Importante</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              ¿Cómo usar las categorías?
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Estas categorías están disponibles al crear o editar productos</li>
              <li>• Cada categoría tiene configuraciones específicas de stock mínimo y márgenes</li>
              <li>• Las categorías ayudan a organizar reportes y análisis de ventas</li>
              <li>• Puedes cambiar la categoría de un producto en cualquier momento</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950/50 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
              Sistema Multi-Rubro
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Este sistema está diseñado para adaptarse a cualquier tipo de negocio. 
              Las categorías cubren desde forrajería tradicional hasta electrónica, 
              permitiendo que cada organización use solo las categorías relevantes para su rubro.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
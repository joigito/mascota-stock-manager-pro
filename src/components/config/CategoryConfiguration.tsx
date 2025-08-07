import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSystemConfiguration } from '@/hooks/useSystemConfiguration';
import { Package, Info } from 'lucide-react';

export const CategoryConfiguration: React.FC = () => {
  const { AVAILABLE_CATEGORIES, getEnabledCategories, updateConfiguration, loading } = useSystemConfiguration();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    if (!loading) {
      const enabled = getEnabledCategories();
      setSelectedCategories(enabled);
    }
  }, [loading, getEnabledCategories]);

  const handleCategoryToggle = (categoryKey: string, checked: boolean) => {
    let newSelected;
    if (checked) {
      newSelected = [...selectedCategories, categoryKey];
    } else {
      newSelected = selectedCategories.filter(key => key !== categoryKey);
    }
    setSelectedCategories(newSelected);
    setIsModified(true);
  };

  const saveChanges = async () => {
    console.log('CategoryConfiguration: Saving categories:', selectedCategories);
    try {
      await updateConfiguration('category_settings', 'enabled_categories', selectedCategories);
      console.log('CategoryConfiguration: Categories saved successfully');
      setIsModified(false);
    } catch (error) {
      console.error('CategoryConfiguration: Error saving categories:', error);
    }
  };

  const resetChanges = () => {
    const enabled = getEnabledCategories();
    setSelectedCategories(enabled);
    setIsModified(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Categorías Habilitadas</span>
          </CardTitle>
          <CardDescription>
            Selecciona las categorías que estarán disponibles para esta organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {AVAILABLE_CATEGORIES.map((category) => (
              <div key={category.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={category.key}
                  checked={selectedCategories.includes(category.key)}
                  onCheckedChange={(checked) => handleCategoryToggle(category.key, checked as boolean)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor={category.key} className="font-medium cursor-pointer">
                      {category.label}
                    </label>
                    <Badge variant="secondary" className="text-xs">{category.key}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {isModified && (
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={saveChanges} className="flex-1">
                Guardar Cambios
              </Button>
              <Button onClick={resetChanges} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          )}
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
              <li>• Selecciona solo las categorías relevantes para tu negocio</li>
              <li>• Las categorías seleccionadas aparecerán al crear productos</li>
              <li>• Puedes cambiar esta configuración en cualquier momento</li>
              <li>• Cada categoría puede tener configuraciones específicas de stock y márgenes</li>
            </ul>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Sistema Multi-Rubro
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              Este sistema se adapta automáticamente a tu tipo de negocio. 
              Habilita solo las categorías que necesites: Informática, Forrajería, 
              Ferretería, Textil, etc. Mantén tu interfaz limpia y enfocada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
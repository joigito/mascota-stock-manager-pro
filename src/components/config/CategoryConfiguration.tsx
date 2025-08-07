import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSystemConfiguration } from '@/hooks/useSystemConfiguration';
import { useOrganization } from '@/hooks/useOrganization';
import { Package, Info, Building2, AlertCircle } from 'lucide-react';

export const CategoryConfiguration: React.FC = () => {
  const { AVAILABLE_CATEGORIES, getEnabledCategories, updateConfiguration, loading } = useSystemConfiguration();
  const { currentOrganization } = useOrganization();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isModified, setIsModified] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('CategoryConfiguration: Loading effect triggered', { 
      loading, 
      currentOrganization: currentOrganization?.name || 'none'
    });
    
    if (!loading && currentOrganization) {
      const enabled = getEnabledCategories();
      console.log('CategoryConfiguration: Setting enabled categories:', enabled);
      setSelectedCategories(enabled);
      setIsModified(false);
    }
  }, [loading, currentOrganization?.id, getEnabledCategories]);

  const handleCategoryToggle = (categoryKey: string, checked: boolean | 'indeterminate') => {
    if (checked === 'indeterminate') return;
    
    console.log('CategoryConfiguration: Toggle category', { categoryKey, checked, currentSelected: selectedCategories });
    
    let newSelected: string[];
    if (checked) {
      newSelected = [...selectedCategories, categoryKey];
    } else {
      newSelected = selectedCategories.filter(key => key !== categoryKey);
    }
    
    // Prevent disabling all categories
    if (newSelected.length === 0) {
      console.log('CategoryConfiguration: Cannot disable all categories');
      return;
    }
    
    console.log('CategoryConfiguration: New selected categories:', newSelected);
    setSelectedCategories(newSelected);
    setIsModified(true);
  };

  const saveChanges = async () => {
    if (!currentOrganization) {
      console.error('CategoryConfiguration: No organization selected');
      return;
    }

    console.log('CategoryConfiguration: Saving categories for org:', currentOrganization.name, selectedCategories);
    setSaving(true);
    
    try {
      await updateConfiguration('category_settings', 'enabled_categories', selectedCategories);
      console.log('CategoryConfiguration: Categories saved successfully');
      setIsModified(false);
    } catch (error) {
      console.error('CategoryConfiguration: Error saving categories:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    const enabled = getEnabledCategories();
    console.log('CategoryConfiguration: Resetting to:', enabled);
    setSelectedCategories(enabled);
    setIsModified(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if no organization
  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay organización seleccionada. Por favor selecciona una organización primero.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Context Header */}
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          Configurando categorías para: <strong>{currentOrganization.name}</strong>
          {' '}({selectedCategories.length} categorías habilitadas)
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Categorías Habilitadas</span>
          </CardTitle>
          <CardDescription>
            Selecciona las categorías que estarán disponibles para esta organización.
            Debe haber al menos una categoría habilitada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {AVAILABLE_CATEGORIES.map((category) => {
              const isChecked = selectedCategories.includes(category.key);
              const isLastCategory = selectedCategories.length === 1 && isChecked;
              
              return (
                <div 
                  key={category.key} 
                  className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${
                    isChecked ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                  } ${isLastCategory ? 'opacity-75' : ''}`}
                >
                  <Checkbox
                    id={category.key}
                    checked={isChecked}
                    disabled={isLastCategory}
                    onCheckedChange={(checked) => handleCategoryToggle(category.key, checked)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <label 
                        htmlFor={category.key} 
                        className={`font-medium cursor-pointer ${isLastCategory ? 'cursor-not-allowed' : ''}`}
                      >
                        {category.label}
                      </label>
                      <Badge 
                        variant={isChecked ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {category.key}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    {isLastCategory && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Debe mantener al menos una categoría habilitada
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {isModified && (
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={saveChanges} 
                disabled={saving || selectedCategories.length === 0}
                className="flex-1"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button 
                onClick={resetChanges} 
                variant="outline" 
                disabled={saving}
                className="flex-1"
              >
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
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ruler, Plus, X, Save } from 'lucide-react';
import { useSystemConfiguration } from '@/hooks/useSystemConfiguration';

export const UnitConfiguration: React.FC = () => {
  const { getUnits, updateConfiguration, loading } = useSystemConfiguration();
  const [units, setUnits] = useState<string[]>(getUnits());
  const [newUnit, setNewUnit] = useState('');
  const [isModified, setIsModified] = useState(false);

  const addUnit = () => {
    if (newUnit.trim() && !units.includes(newUnit.trim())) {
      const updatedUnits = [...units, newUnit.trim()];
      setUnits(updatedUnits);
      setNewUnit('');
      setIsModified(true);
    }
  };

  const removeUnit = (unitToRemove: string) => {
    const updatedUnits = units.filter(unit => unit !== unitToRemove);
    setUnits(updatedUnits);
    setIsModified(true);
  };

  const saveChanges = async () => {
    await updateConfiguration('unit_settings', 'available_units', units);
    setIsModified(false);
  };

  const resetChanges = () => {
    setUnits(getUnits());
    setIsModified(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ruler className="h-5 w-5" />
            <span>Unidades de Medida</span>
          </CardTitle>
          <CardDescription>
            Configura las unidades de medida disponibles para tus productos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {units.map((unit) => (
              <Badge key={unit} variant="secondary" className="flex items-center space-x-1">
                <span>{unit}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeUnit(unit)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="Nueva unidad de medida..."
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addUnit();
                }
              }}
            />
            <Button onClick={addUnit} disabled={!newUnit.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
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
          <CardTitle>Unidades Comunes por Rubro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Comercio General</h4>
              <div className="flex flex-wrap gap-1">
                {['unidades', 'docenas', 'cajas', 'paquetes'].map(unit => (
                  <Badge key={unit} variant="outline" className="text-xs">
                    {unit}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Peso y Volumen</h4>
              <div className="flex flex-wrap gap-1">
                {['kg', 'gramos', 'toneladas', 'litros'].map(unit => (
                  <Badge key={unit} variant="outline" className="text-xs">
                    {unit}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Medidas Lineales</h4>
              <div className="flex flex-wrap gap-1">
                {['metros', 'centímetros', 'pulgadas'].map(unit => (
                  <Badge key={unit} variant="outline" className="text-xs">
                    {unit}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Servicios</h4>
              <div className="flex flex-wrap gap-1">
                {['horas', 'días', 'sesiones', 'consultas'].map(unit => (
                  <Badge key={unit} variant="outline" className="text-xs">
                    {unit}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
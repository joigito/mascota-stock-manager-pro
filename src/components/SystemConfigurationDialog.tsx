import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package, Ruler, TrendingUp } from 'lucide-react';
import { CategoryConfiguration } from './config/CategoryConfiguration';
import { UnitConfiguration } from './config/UnitConfiguration';
import { StockConfiguration } from './config/StockConfiguration';
import { MarginConfiguration } from './config/MarginConfiguration';

interface SystemConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SystemConfigurationDialog: React.FC<SystemConfigurationDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Configuración del Sistema</span>
          </DialogTitle>
          <DialogDescription>
            Administra los parámetros globales para hacer el sistema adaptable a cualquier rubro
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Categorías</span>
            </TabsTrigger>
            <TabsTrigger value="units" className="flex items-center space-x-2">
              <Ruler className="h-4 w-4" />
              <span className="hidden sm:inline">Unidades</span>
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Stock Mínimo</span>
            </TabsTrigger>
            <TabsTrigger value="margins" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Márgenes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-6">
            <CategoryConfiguration />
          </TabsContent>

          <TabsContent value="units" className="mt-6">
            <UnitConfiguration />
          </TabsContent>

          <TabsContent value="stock" className="mt-6">
            <StockConfiguration />
          </TabsContent>

          <TabsContent value="margins" className="mt-6">
            <MarginConfiguration />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
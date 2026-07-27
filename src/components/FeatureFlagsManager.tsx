import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURES, FEATURES_BY_CATEGORY, FeatureDefinition } from '@/config/features';

const CATEGORY_LABELS: Record<string, string> = {
  ventas: 'Ventas',
  inventario: 'Inventario',
  clientes: 'Clientes',
  reportes: 'Reportes',
};

const FeatureToggle = ({ feature }: { feature: FeatureDefinition }) => {
  const { isEnabled, toggle, loading } = useFeatureFlag(feature.key);
  const Icon = feature.icon;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium">{feature.name}</Label>
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {feature.description}
          </p>
        </div>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={toggle}
        disabled={loading}
      />
    </div>
  );
};

export const FeatureFlagsManager = () => {
  const categories = Object.keys(FEATURES_BY_CATEGORY);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Features de la Tienda</CardTitle>
        </div>
        <CardDescription>
          Activa o desactiva funcionalidades para esta tienda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0]}>
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {CATEGORY_LABELS[category] || category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4 mt-4">
              {FEATURES_BY_CATEGORY[category]?.map((feature) => (
                <FeatureToggle key={feature.key} feature={feature} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

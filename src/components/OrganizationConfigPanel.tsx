import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, Receipt, CreditCard, Settings } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlag';
import { FEATURES } from '@/config/features';
import { ElectronicInvoicingConfig } from './ElectronicInvoicingConfig';
import { CurrentAccountConfig } from './CurrentAccountConfig';
import { FeatureFlagsManager } from './FeatureFlagsManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug?: string;
}

export const OrganizationConfigPanel: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
      if (data && data.length > 0) {
        setSelectedOrgId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las organizaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Seleccionar Organización
          </CardTitle>
          <CardDescription>
            Elegí la organización para configurar sus módulos y features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrgId(org.id)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedOrgId === org.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{org.name}</span>
                </div>
                {org.slug && (
                  <p className="text-xs text-muted-foreground mt-1">
                    /tienda/{org.slug}
                  </p>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      {selectedOrgId && (
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="features">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="features" className="text-xs sm:text-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="invoicing" className="text-xs sm:text-sm">
                  <Receipt className="h-4 w-4 mr-2" />
                  Facturación
                </TabsTrigger>
                <TabsTrigger value="current-account" className="text-xs sm:text-sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cta. Cte.
                </TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="mt-6">
                <OrganizationFeatureFlags organizationId={selectedOrgId} />
              </TabsContent>

              <TabsContent value="invoicing" className="mt-6">
                <ElectronicInvoicingConfig organizationId={selectedOrgId} />
              </TabsContent>

              <TabsContent value="current-account" className="mt-6">
                <CurrentAccountConfig organizationId={selectedOrgId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Internal component for feature flags per organization
const OrganizationFeatureFlags: React.FC<{ organizationId: string }> = ({ organizationId }) => {
  const featureKeys = Object.keys(FEATURES);
  const { features, loading, isEnabled, toggle } = useFeatureFlags(featureKeys);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Activá o desactivá funcionalidades para esta organización
      </p>
      {Object.values(FEATURES).map((feature) => {
        const Icon = feature.icon;
        const enabled = isEnabled(feature.key);
        return (
          <div
            key={feature.key}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{feature.name}</span>
                  <Badge variant={enabled ? 'default' : 'secondary'}>
                    {enabled ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {feature.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggle(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
};

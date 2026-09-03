import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, Building2, Receipt, CreditCard, Settings, Loader2, Check, X } from 'lucide-react';
import { FEATURES } from '@/config/features';
import { ElectronicInvoicingConfig } from './ElectronicInvoicingConfig';
import { CurrentAccountConfig } from './CurrentAccountConfig';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { validateSlug, checkSlugAvailable } from '@/lib/slug';

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

      {/* Slug Editor */}
      {selectedOrgId && (
        <SlugEditor
          organizationId={selectedOrgId}
          currentSlug={organizations.find(o => o.id === selectedOrgId)?.slug}
          onUpdated={(newSlug) => {
            setOrganizations(prev =>
              prev.map(o => o.id === selectedOrgId ? { ...o, slug: newSlug } : o)
            );
          }}
        />
      )}

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

// Standalone component for feature flags per organization (doesn't depend on global org state)
const OrganizationFeatureFlags: React.FC<{ organizationId: string }> = ({ organizationId }) => {
  const [features, setFeatures] = useState<Record<string, { enabled: boolean }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatures();
  }, [organizationId]);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_features')
        .select('feature_key, enabled')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const featuresMap: Record<string, { enabled: boolean }> = {};
      Object.keys(FEATURES).forEach((key) => {
        featuresMap[key] = { enabled: false };
      });
      (data || []).forEach((row) => {
        featuresMap[row.feature_key] = { enabled: row.enabled };
      });
      setFeatures(featuresMap);
    } catch (error) {
      console.error('Error loading features:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (key: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('organization_features')
        .upsert(
          { organization_id: organizationId, feature_key: key, enabled },
          { onConflict: 'organization_id,feature_key' }
        );

      if (error) throw error;

      setFeatures((prev) => ({
        ...prev,
        [key]: { enabled },
      }));
      sonnerToast(enabled ? 'Feature habilitada' : 'Feature deshabilitada');
    } catch (error) {
      console.error('Error toggling feature:', error);
      sonnerToast.error('Error al actualizar feature');
    }
  };

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
        const enabled = features[feature.key]?.enabled || false;
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
              onClick={() => toggle(feature.key, !enabled)}
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

const SlugEditor: React.FC<{
  organizationId: string;
  currentSlug?: string;
  onUpdated: (newSlug: string) => void;
}> = ({ organizationId, currentSlug, onUpdated }) => {
  const [slug, setSlug] = useState(currentSlug || '');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });
  const [available, setAvailable] = useState<{ checked: boolean; ok: boolean; msg?: string }>({
    checked: true,
    ok: true,
  });
  const { toast } = useToast();

  const slugChanged = slug.trim() !== (currentSlug || '');
  const disabled = saving || checking || !slugChanged || !validation.valid;

  const handleSlugChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    setSlug(clean);
    setValidation(validateSlug(clean));
    setAvailable({ checked: false, ok: true });
  };

  useEffect(() => {
    if (!slugChanged || !validation.valid) {
      setAvailable({ checked: true, ok: true });
      return;
    }
    const timer = setTimeout(async () => {
      setChecking(true);
      const result = await checkSlugAvailable(slug, organizationId);
      setAvailable({ checked: true, ok: result.available, msg: result.error });
      setChecking(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, slugChanged, validation.valid, organizationId]);

  const handleSave = async () => {
    if (disabled) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ slug: slug.trim() })
        .eq('id', organizationId);

      if (error) throw error;
      onUpdated(slug.trim());
      toast({ title: 'URL actualizada', description: `/tienda/${slug.trim()}` });
      sonnerToast.success('Slug guardado');
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el slug', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          URL de la Tienda
        </CardTitle>
        <CardDescription>
          Elegí un slug corto para la URL. Ejemplo: <code className="font-mono">/tienda/{slug || 'abcd'}</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full space-y-1">
            <Label htmlFor="slug-input">Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">/tienda/</span>
              <Input
                id="slug-input"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="abcd"
                className="font-mono flex-1"
                maxLength={20}
              />
            </div>
            {slugChanged && validation.valid && !checking && !available.ok && (
              <p className="text-xs text-destructive">
                {available.msg || 'Ese slug ya está en uso'}
              </p>
            )}
            {!validation.valid && validation.error && (
              <p className="text-xs text-destructive">{validation.error}</p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={disabled}
            className="sm:mt-6"
            size="sm"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : slugChanged && validation.valid && available.ok ? (
              <Check className="h-4 w-4" />
            ) : null}
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

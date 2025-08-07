import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const OrganizationUrlGenerator: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isSuperAdmin, organizations: userOrganizations } = useOrganization();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const isSuperAdminUser = await isSuperAdmin();
      
      if (isSuperAdminUser) {
        // Super admins can see all organizations
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name, slug, description')
          .order('name');

        if (error) throw error;
        setOrganizations(data || []);
      } else {
        // Organization admins only see their organizations
        const userOrgList = userOrganizations || [];
        const filteredOrgs = userOrgList.map(userOrg => ({
          id: userOrg.organization.id,
          name: userOrg.organization.name,
          slug: userOrg.organization.slug,
          description: userOrg.organization.description
        }));
        setOrganizations(filteredOrgs);
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

  const generateUrl = (slug: string) => {
    return `${window.location.origin}/tienda/${slug}`;
  };

  const copyToClipboard = async (url: string, orgId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(orgId);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "URL copiada",
        description: "La URL ha sido copiada al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar la URL",
        variant: "destructive",
      });
    }
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generador de URLs</CardTitle>
          <CardDescription>Cargando organizaciones...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>URLs Personalizadas para Clientes</CardTitle>
        <CardDescription>
          Comparte estas URLs con tus clientes potenciales para que accedan directamente a su tienda personalizada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {organizations.map((org) => {
          const url = generateUrl(org.slug);
          const isCopied = copiedId === org.id;
          
          return (
            <div key={org.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {org.slug}
                    </Badge>
                  </div>
                  {org.description && (
                    <p className="text-sm text-muted-foreground mb-2">{org.description}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  URL personalizada:
                </label>
                <div className="flex gap-2">
                  <Input
                    value={url}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(url, org.id)}
                    className="shrink-0"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUrl(url)}
                    className="shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        
        {organizations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay organizaciones disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
};
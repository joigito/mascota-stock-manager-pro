import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Settings, Database, Shield, AlertTriangle } from 'lucide-react';
import { OrganizationManager } from './OrganizationManager';
import { OrganizationConfigPanel } from './OrganizationConfigPanel';
import { OrganizationUrlGenerator } from './OrganizationUrlGenerator';
import { UserManagement } from './UserManagement';
import { supabase } from '@/integrations/supabase/client';

export const SuperAdminDashboard: React.FC = () => {
  const { organizations, loading, switchOrganization } = useOrganization();
  const [systemStats, setSystemStats] = useState({ users: 0, stores: 0, products: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      const [usersRes, storesRes, productsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true })
      ]);

      setSystemStats({
        users: usersRes.count || 0,
        stores: storesRes.count || 0,
        products: productsRes.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel Central</h1>
          <p className="text-muted-foreground">
            Sistema de stock y ventas - Gestión centralizada
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Super Admin</span>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : systemStats.users}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiendas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : systemStats.stores}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : systemStats.products}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organizaciones
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <OrganizationManager />
          
          {/* Quick Access to Stores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Acceso Rápido a Tiendas
              </CardTitle>
              <CardDescription>
                Seleccioná una tienda para administrarla
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : organizations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay tiendas disponibles
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        switchOrganization(org);
                        window.location.reload();
                      }}
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                    >
                      <Building2 className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{org.name}</div>
                        {org.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {org.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <OrganizationConfigPanel />
          <OrganizationUrlGenerator />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Base de datos</span>
                </div>
                <Badge variant="default">Operativa</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">API</span>
                </div>
                <Badge variant="default">Operativa</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Autenticación</span>
                </div>
                <Badge variant="secondary">Supabase Auth</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

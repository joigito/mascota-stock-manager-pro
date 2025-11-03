import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Shield, 
  Settings, 
  TrendingUp,
  Database,
  Activity,
  LogOut,
  UserCog
} from 'lucide-react';
import { OrganizationManager } from '@/components/OrganizationManager';
import { UserManagement } from '@/components/UserManagement';
import { QuickActionsDialog } from '@/components/QuickActionsDialog';
import { TransferOwnershipDialog } from '@/components/TransferOwnershipDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalOrganizations: number;
}

export const SuperAdminDashboard: React.FC = () => {
  const { signOut, user } = useAuth();
  const { organizations, switchOrganization } = useOrganization();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'system' | 'users' | 'backup' | 'variants' | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalOrganizations: orgCount || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-background">
      {/* Header */}
  <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-lg bg-primary text-primary-foreground">
                <Shield className="h-6 w-6 sm:h-10 sm:w-10" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-foreground">
                  Panel de Super Administrador
                </h1>
                <p className="text-xs sm:text-base text-muted-foreground">Gestión central del sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge variant="secondary">
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-border"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizaciones</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
              <p className="text-xs text-muted-foreground">
                Tiendas registradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Organizations Access */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Gestiona el sistema desde aquí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  setDialogType('system');
                  setDialogOpen(true);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configuración del Sistema
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  setDialogType('users');
                  setDialogOpen(true);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Gestionar Roles de Usuario
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  setDialogType('backup');
                  setDialogOpen(true);
                }}
              >
                <Database className="h-4 w-4 mr-2" />
                Respaldos de Base de Datos
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  setDialogType('variants');
                  setDialogOpen(true);
                }}
              >
                <Activity className="h-4 w-4 mr-2" />
                Gestionar Variantes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>
                Monitoreo general
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estado del servidor</span>
                <Badge variant="secondary">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Base de datos</span>
                <Badge variant="secondary">Conectada</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Últimas actualizaciones</span>
                <span className="text-sm text-muted-foreground">Hace 2 min</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Acceso a Tiendas
              </CardTitle>
              <CardDescription>
                Entra a administrar tiendas específicas
              </CardDescription>
            </CardHeader>
                        <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                          {organizations.map((userOrg) => (
                            <div key={userOrg.organization.id} className="flex items-center justify-between">
                              <Button 
                                className="flex-1 justify-start mr-2" 
                                variant="outline"
                                onClick={() => {
                                  console.log('SuperAdminDashboard: Switching to organization:', userOrg.organization);
                                  switchOrganization(userOrg.organization);
                                  // Force a page refresh after a short delay to ensure state is updated
                                  setTimeout(() => {
                                    console.log('SuperAdminDashboard: Triggering page refresh/re-render');
                                    window.location.reload();
                                  }, 200);
                                }}
                              >
                                <Building2 className="h-4 w-4 mr-2" />
                                {userOrg.organization.name}
                              </Button>
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedOrganization(userOrg.organization);
                                  setTransferDialogOpen(true);
                                }}
                                className="text-foreground hover:bg-muted/50"
                              >
                                Vender
                              </Button>
                            </div>
                          ))}
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-2">URLs dedicadas por tienda:</p>
                            {organizations.map((userOrg) => (
                              <div key={userOrg.organization.id} className="text-xs bg-muted/50 p-2 rounded mb-1">
                                <code className="text-muted-foreground">{window.location.origin}/tienda/{userOrg.organization.slug || userOrg.organization.name.toLowerCase().replace(/\s+/g, '-')}</code>
                              </div>
                            ))}
                          </div>
                        </CardContent>
          </Card>
        </div>

        {/* Unified Management Tabs */}
        <Tabs defaultValue="organizations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organizaciones
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Usuarios y Roles
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="organizations" className="mt-6">
            <OrganizationManager />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>

      {/* Quick Actions Dialog */}
      <QuickActionsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionType={dialogType}
      />

      {/* Transfer Ownership Dialog */}
      <TransferOwnershipDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        organization={selectedOrganization}
        onTransferComplete={() => {
          // Reload organizations after transfer
          window.location.reload();
        }}
      />
    </div>
  );
};
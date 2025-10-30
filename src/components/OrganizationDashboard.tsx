import React from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, ChevronRight } from 'lucide-react';
import { OrganizationManager } from './OrganizationManager';
import { OrganizationUserManagement } from './OrganizationUserManagement';
import VariantAttributeManager from './VariantAttributeManager';
import { useState } from 'react';

export const OrganizationDashboard: React.FC = () => {
  const { organizations, switchOrganization, loading } = useOrganization();
  const [openOrgId, setOpenOrgId] = useState<string | undefined>(undefined);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando organizaciones...</p>
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <Building2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Bienvenido al Sistema</h1>
            <p className="text-muted-foreground">No tienes acceso a ninguna organización aún</p>
          </div>
          <OrganizationManager />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Building2 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-2">Selecciona una Organización</h1>
          <p className="text-muted-foreground">Elige la organización con la que deseas trabajar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((userOrg) => (
            <Card 
              key={userOrg.organization.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/20"
              onClick={() => {
                switchOrganization(userOrg.organization);
                // Force a page refresh to load the main app
                window.location.reload();
              }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{userOrg.organization.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground capitalize">{userOrg.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setOpenOrgId(userOrg.organization.id); }}>
                      Atributos
                    </Button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              {userOrg.organization.description && (
                <CardContent className="pt-0">
                  <CardDescription>{userOrg.organization.description}</CardDescription>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <OrganizationManager />
        </div>
        {openOrgId && (
          <VariantAttributeManager
            organizationId={openOrgId}
            open={Boolean(openOrgId)}
            onClose={() => setOpenOrgId(undefined)}
          />
        )}
      </div>
    </div>
  );
};
import React, { useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';

export const OrganizationDashboard: React.FC = () => {
  const { organizations, switchOrganization, loading } = useOrganization();

  useEffect(() => {
    if (!loading && organizations.length > 0) {
      // Auto-select the first organization and reload
      switchOrganization(organizations[0].organization);
      window.location.reload();
    }
  }, [loading, organizations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              No tienes acceso a ninguna organización. Contactá al administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

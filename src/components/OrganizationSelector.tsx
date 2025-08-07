import React from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const OrganizationSelector: React.FC = () => {
  const { organizations, currentOrganization, switchOrganization, loading, reload } = useOrganization();

  console.log('OrganizationSelector: Render state:', {
    loading,
    organizationsCount: organizations.length,
    currentOrganization: currentOrganization?.name || 'none',
    hasOrganizations: organizations.length > 0
  });

  // Always show the selector container
  return (
    <div className="flex items-center space-x-2">
      <Building2 className="w-4 h-4 text-muted-foreground" />
      
      {loading ? (
        // Show skeleton while loading
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-48" />
          <span className="text-sm text-muted-foreground">Cargando organizaciones...</span>
        </div>
      ) : organizations.length === 0 ? (
        // Show message and reload button when no organizations
        <div className="flex items-center space-x-2">
          <div className="h-10 w-48 flex items-center justify-center border border-input rounded-md bg-background px-3 text-sm text-muted-foreground">
            Sin organizaciones
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={reload}
            className="h-10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        // Show functional selector
        <Select 
          value={currentOrganization?.id || ''} 
          onValueChange={(value) => {
            console.log('OrganizationSelector: Changing to organization:', value);
            const org = organizations.find(o => o.organization.id === value);
            if (org) {
              console.log('OrganizationSelector: Found organization:', org.organization.name);
              switchOrganization(org.organization);
            } else {
              console.log('OrganizationSelector: Organization not found in list');
            }
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar organización" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((userOrg) => (
              <SelectItem key={userOrg.organization.id} value={userOrg.organization.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{userOrg.organization.name}</span>
                  <span className="text-xs text-muted-foreground ml-2 capitalize">
                    {userOrg.role}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
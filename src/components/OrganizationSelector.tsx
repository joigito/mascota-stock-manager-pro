import React from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';

export const OrganizationSelector: React.FC = () => {
  const { organizations, currentOrganization, switchOrganization, loading } = useOrganization();

  if (loading || organizations.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="w-4 h-4 text-muted-foreground" />
      <Select 
        value={currentOrganization?.id || ''} 
        onValueChange={(value) => {
          const org = organizations.find(o => o.organization.id === value);
          if (org) {
            switchOrganization(org.organization);
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
    </div>
  );
};
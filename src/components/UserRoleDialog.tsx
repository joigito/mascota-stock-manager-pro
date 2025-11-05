import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Building2, User, Crown, Trash2, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  created_at: string;
  organization: {
    id: string;
    name: string;
    slug?: string;
  };
}

interface UserWithRoles {
  user: User;
  globalRoles: UserRole[];
  organizationRoles: UserOrganization[];
}

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userWithRoles: UserWithRoles | null;
  onAssignGlobalRole: (userId: string, role: string) => Promise<void>;
  onRemoveGlobalRole: (userId: string, role: string) => Promise<void>;
  onUpdateOrganizationRole: (userId: string, organizationId: string, newRole: string) => Promise<void>;
  onRemoveFromOrganization: (userId: string, organizationId: string) => Promise<void>;
}

const globalRoleOptions = [
  { value: 'super_admin', label: 'Super Administrador', icon: Crown },
  { value: 'admin', label: 'Administrador', icon: Shield },
  { value: 'user', label: 'Usuario', icon: User },
];

const organizationRoleOptions = [
  { value: 'admin', label: 'Administrador', icon: Shield },
  { value: 'user', label: 'Usuario', icon: User },
];

export const UserRoleDialog: React.FC<UserRoleDialogProps> = ({
  open,
  onOpenChange,
  userWithRoles,
  onAssignGlobalRole,
  onRemoveGlobalRole,
  onUpdateOrganizationRole,
  onRemoveFromOrganization,
}) => {
  const { user: currentUser } = useAuth();
  const [selectedGlobalRole, setSelectedGlobalRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkSuperAdmin = () => {
      if (!userWithRoles) return;
      const hasSuperAdminRole = userWithRoles.globalRoles.some(r => r.role === 'super_admin');
      setIsSuperAdmin(hasSuperAdminRole);
    };
    
    checkSuperAdmin();
  }, [userWithRoles]);

  if (!userWithRoles) return null;
  
  const isEditingSelf = currentUser?.id === userWithRoles.user.id;

  const handleAssignGlobalRole = async () => {
    if (!selectedGlobalRole) return;
    
    setLoading(true);
    try {
      await onAssignGlobalRole(userWithRoles.user.id, selectedGlobalRole);
      setSelectedGlobalRole('');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGlobalRole = async (role: string) => {
    setLoading(true);
    try {
      await onRemoveGlobalRole(userWithRoles.user.id, role);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrganizationRole = async (organizationId: string, newRole: string) => {
    setLoading(true);
    try {
      await onUpdateOrganizationRole(userWithRoles.user.id, organizationId, newRole);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromOrganization = async (organizationId: string) => {
    setLoading(true);
    try {
      await onRemoveFromOrganization(userWithRoles.user.id, organizationId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Gestionar Roles de Usuario
          </DialogTitle>
          <DialogDescription>
            Usuario: {userWithRoles.user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Global Roles Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Crown className="h-4 w-4 mr-2" />
                Roles Globales del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info Alert */}
              {isEditingSelf && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Por seguridad, no puedes modificar tus propios roles globales.
                  </AlertDescription>
                </Alert>
              )}
              
              {!isSuperAdmin && !isEditingSelf && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Solo super admins pueden gestionar roles globales.
                  </AlertDescription>
                </Alert>
              )}

              {/* Current Global Roles */}
              <div>
                <h4 className="text-sm font-medium mb-2">Roles Actuales:</h4>
                {userWithRoles.globalRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userWithRoles.globalRoles.map((roleData) => {
                      const roleOption = globalRoleOptions.find(opt => opt.value === roleData.role);
                      const IconComponent = roleOption?.icon || Shield;
                      const canDelete = isSuperAdmin && !isEditingSelf;
                      
                      return (
                        <Badge key={roleData.id} variant="secondary" className="flex items-center gap-1">
                          <IconComponent className="h-3 w-3" />
                          {roleOption?.label || roleData.role}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => handleRemoveGlobalRole(roleData.role)}
                                    disabled={loading || !canDelete}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {!canDelete && (
                                <TooltipContent>
                                  {isEditingSelf 
                                    ? "No puedes eliminar tus propios roles globales" 
                                    : "Solo super admins pueden eliminar roles globales"}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin roles globales asignados</p>
                )}
              </div>

              {/* Assign New Global Role */}
              <div className="flex gap-2">
                <Select 
                  value={selectedGlobalRole} 
                  onValueChange={setSelectedGlobalRole}
                  disabled={!isSuperAdmin || isEditingSelf}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar rol global..." />
                  </SelectTrigger>
                  <SelectContent>
                    {globalRoleOptions.map((option) => {
                      const IconComponent = option.icon;
                      const hasRole = userWithRoles.globalRoles.some(r => r.role === option.value);
                      
                      return (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          disabled={hasRole}
                        >
                          <div className="flex items-center">
                            <IconComponent className="h-4 w-4 mr-2" />
                            {option.label}
                            {hasRole && <span className="ml-2 text-xs text-muted-foreground">(ya asignado)</span>}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAssignGlobalRole}
                  disabled={!selectedGlobalRole || loading || !isSuperAdmin || isEditingSelf}
                >
                  Asignar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Organization Roles Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Building2 className="h-4 w-4 mr-2" />
                Roles en Organizaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userWithRoles.organizationRoles.length > 0 ? (
                <div className="space-y-3">
                  {userWithRoles.organizationRoles.map((orgRole) => (
                    <div key={orgRole.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{orgRole.organization.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Rol actual: {organizationRoleOptions.find(opt => opt.value === orgRole.role)?.label || orgRole.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={orgRole.role} 
                          onValueChange={(newRole) => handleUpdateOrganizationRole(orgRole.organization_id, newRole)}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {organizationRoleOptions.map((option) => {
                              const IconComponent = option.icon;
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center">
                                    <IconComponent className="h-4 w-4 mr-2" />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveFromOrganization(orgRole.organization_id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Este usuario no pertenece a ninguna organización
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Crown, 
  Shield, 
  Building2, 
  Search,
  Settings,
  User,
  Calendar,
  UserPlus,
  Plus
} from 'lucide-react';
import { UserRoleDialog } from './UserRoleDialog';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserWithRoles {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  globalRoles: Array<{
    id: string;
    user_id: string;
    role: string;
    created_at: string;
  }>;
  organizationRoles: Array<{
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
  }>;
}

export const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    loadUsers,
    assignGlobalRole,
    removeGlobalRole,
    updateOrganizationRole,
    removeUserFromOrganization,
  } = useUserRoles();

  const { toast } = useToast();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  
  // Create User Dialog State
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserOrganization, setNewUserOrganization] = useState('');
  
  
  // Organizations for dropdowns
  const [organizations, setOrganizations] = useState<Array<{id: string, name: string}>>([]);
  
  // Load organizations for dropdowns
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const { data } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name');
        setOrganizations(data || []);
      } catch (error) {
        console.error('Error loading organizations:', error);
      }
    };
    loadOrganizations();
  }, []);

  const filteredUsers = users.filter(userWithRoles =>
    userWithRoles.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userWithRoles.user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Super Admin
          </Badge>
        );
      case 'admin':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {role}
          </Badge>
        );
    }
  };

  const handleEditUser = (userWithRoles: UserWithRoles) => {
    setSelectedUser(userWithRoles);
    setUserDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Error",
        description: "Email y contraseña son requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the edge function to create user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          organizationId: newUserOrganization
        }
      });

      // Handle Supabase function errors (like 400, 403, etc.)
      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "Error",
          description: error.message || "No se pudo crear el usuario",
          variant: "destructive",
        });
        return;
      }

      // Handle application-level errors returned in the response data
      if (data && !data.success && data.error) {
        console.error('Application error:', data.error);
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Success case
      toast({
        title: "Usuario creado",
        description: `Usuario ${newUserEmail} creado exitosamente`,
      });

      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      setNewUserOrganization('');
      setCreateUserOpen(false);
      
      // Reload users list
      await loadUsers();
    } catch (error: any) {
      console.error('Unexpected error creating user:', error);
      toast({
        title: "Error",
        description: "Error inesperado al crear el usuario",
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Gestión de Usuarios del Sistema
          </CardTitle>
          <CardDescription>
            Administra roles y permisos de todos los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios por email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Crear Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newUserEmail">Email</Label>
                      <Input
                        id="newUserEmail"
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="usuario@ejemplo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newUserPassword">Contraseña Temporal</Label>
                      <Input
                        id="newUserPassword"
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Contraseña temporal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newUserRole">Rol Global</Label>
                      <Select value={newUserRole} onValueChange={setNewUserRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="super_admin">Super Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newUserOrganization">Organización (Opcional)</Label>
                      <Select value={newUserOrganization} onValueChange={setNewUserOrganization}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar organización" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin organización</SelectItem>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setCreateUserOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateUser}>
                        Crear Usuario
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Roles Globales</TableHead>
                  <TableHead>Organizaciones</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-center">
                        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userWithRoles) => (
                    <TableRow key={userWithRoles.user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{userWithRoles.user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {userWithRoles.user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {userWithRoles.globalRoles.length > 0 ? (
                            userWithRoles.globalRoles.map((roleData) => (
                              <div key={roleData.id}>
                                {getRoleBadge(roleData.role)}
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin roles</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {userWithRoles.organizationRoles.length > 0 ? (
                            userWithRoles.organizationRoles.slice(0, 2).map((orgRole) => (
                              <div key={orgRole.id} className="flex items-center gap-2 text-sm">
                                <Building2 className="h-3 w-3" />
                                <span className="truncate max-w-24">{orgRole.organization.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {orgRole.role}
                                </Badge>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin organizaciones</span>
                          )}
                          {userWithRoles.organizationRoles.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{userWithRoles.organizationRoles.length - 2} más
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(userWithRoles.user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(userWithRoles)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Gestionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Usuarios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.globalRoles.some(r => r.role === 'super_admin')).length}
              </p>
              <p className="text-sm text-muted-foreground">Super Admins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.organizationRoles.some(r => r.role === 'admin')).length}
              </p>
              <p className="text-sm text-muted-foreground">Admins de Org</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.organizationRoles.length > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">Con Organizaciones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Role Dialog */}
      <UserRoleDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        userWithRoles={selectedUser}
        onAssignGlobalRole={assignGlobalRole}
        onRemoveGlobalRole={removeGlobalRole}
        onUpdateOrganizationRole={updateOrganizationRole}
        onRemoveFromOrganization={removeUserFromOrganization}
      />
    </div>
  );
};
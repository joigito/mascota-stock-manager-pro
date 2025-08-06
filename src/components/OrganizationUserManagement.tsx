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
  Shield, 
  Building2, 
  Search,
  Settings,
  User,
  Calendar,
  UserMinus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';

interface OrganizationUser {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  created_at: string;
  user_email?: string;
  user_created_at?: string;
}


export const OrganizationUserManagement: React.FC = () => {
  const { currentOrganization, isAdmin } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add User Dialog State
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [addUserEmail, setAddUserEmail] = useState('');
  const [addUserRole, setAddUserRole] = useState('user');
  
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (user && currentOrganization) {
        const hasAccess = await isAdmin();
        setHasAdminAccess(hasAccess);
        if (hasAccess) {
          loadData();
        }
      }
    };
    checkAdminAccess();
  }, [currentOrganization, user]);

  const loadData = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      
      // Load organization users with their email from auth.users
      const { data: orgUsers, error: usersError } = await supabase
        .from('user_organizations')
        .select(`
          id,
          user_id,
          organization_id,
          role,
          created_at
        `)
        .eq('organization_id', currentOrganization.id);

      if (usersError) throw usersError;

      // Get user emails using the secure function
      const { data: allUsersData, error: allUsersError } = await supabase
        .rpc('get_users_with_roles');

      if (allUsersError) {
        console.warn('Error getting user emails:', allUsersError);
      }

      // Map organization users with their email data
      const usersWithEmails = (orgUsers || []).map((orgUser) => {
        const userData = allUsersData?.find(u => u.user_id === orgUser.user_id);
        return {
          ...orgUser,
          user_email: userData?.email || `user-${orgUser.user_id.slice(0, 8)}@example.com`,
          user_created_at: userData?.created_at || orgUser.created_at
        };
      });

      setUsers(usersWithEmails);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!addUserEmail || !currentOrganization) {
      toast({
        title: "Error",
        description: "El email es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user by email using the secure function
      const { data: usersData, error: userError } = await supabase
        .rpc('get_users_with_roles');

      if (userError) throw userError;

      const existingUser = usersData?.find(u => u.email.toLowerCase() === addUserEmail.trim().toLowerCase());
      
      if (!existingUser) {
        toast({
          title: "Error",
          description: "No se encontró un usuario con ese email",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already in the organization
      const { data: existingMembership } = await supabase
        .from('user_organizations')
        .select('id')
        .eq('user_id', existingUser.user_id)
        .eq('organization_id', currentOrganization.id)
        .single();

      if (existingMembership) {
        toast({
          title: "Error",
          description: "El usuario ya pertenece a esta organización",
          variant: "destructive",
        });
        return;
      }

      // Add user to organization
      const { error: insertError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: existingUser.user_id,
          organization_id: currentOrganization.id,
          role: addUserRole
        });

      if (insertError) throw insertError;

      toast({
        title: "Usuario agregado",
        description: `${addUserEmail} ha sido agregado a la organización`,
      });

      setAddUserEmail('');
      setAddUserRole('user');
      setAddUserDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error adding user:', error);
      
      toast({
        title: "Error",
        description: "No se pudo agregar el usuario",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_organizations')
        .update({ role: newRole })
        .eq('user_id', userId)
        .eq('organization_id', currentOrganization?.id);

      if (error) throw error;

      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado",
      });

      loadData();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_organizations')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', currentOrganization?.id);

      if (error) throw error;

      toast({
        title: "Usuario removido",
        description: "El usuario ha sido removido de la organización",
      });

      loadData();
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Error",
        description: "No se pudo remover el usuario",
        variant: "destructive",
      });
    }
  };


  const filteredUsers = users.filter(user =>
    user.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentOrganization || !hasAdminAccess) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sin acceso</h3>
          <p className="text-muted-foreground">
            Solo los administradores pueden gestionar usuarios de la organización
          </p>
        </CardContent>
      </Card>
    );
  }

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
            <Building2 className="h-5 w-5 mr-2" />
            Gestión de Usuarios - {currentOrganization.name}
          </CardTitle>
          <CardDescription>
            Administra usuarios y roles de tu organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <User className="w-4 h-4 mr-2" />
                  Agregar Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Agregar Usuario a {currentOrganization.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="addUserEmail">Email del Usuario Existente</Label>
                    <Input
                      id="addUserEmail"
                      type="email"
                      value={addUserEmail}
                      onChange={(e) => setAddUserEmail(e.target.value)}
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addUserRole">Rol</Label>
                    <Select value={addUserRole} onValueChange={setAddUserRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddUser}>
                      Agregar Usuario
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-center">
                        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios en esta organización'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((orgUser) => (
                    <TableRow key={orgUser.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{orgUser.user_email}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {orgUser.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={orgUser.role === 'admin' ? 'secondary' : 'outline'} className="flex items-center gap-1 w-fit">
                          {orgUser.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                          {orgUser.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(orgUser.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={orgUser.role}
                            onValueChange={(newRole) => handleUpdateUserRole(orgUser.user_id, newRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuario</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveUser(orgUser.user_id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>


          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Usuarios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.role === 'user').length}
              </p>
              <p className="text-sm text-muted-foreground">Usuarios Regulares</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
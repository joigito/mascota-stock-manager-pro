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
  Mail,
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

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export const OrganizationUserManagement: React.FC = () => {
  const { currentOrganization, isAdmin } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Invitation Dialog State
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  
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

      // Get user emails by querying auth metadata (we'll need to get this from user_roles or handle differently)
      // For now, let's get the users and their emails from a different approach
      const userIds = orgUsers?.map(u => u.user_id) || [];
      
      // Since we can't directly query auth.users, we'll need to get emails differently
      // Let's get users with their basic info
      const usersWithEmails = await Promise.all(
        (orgUsers || []).map(async (orgUser) => {
          // We'll need to find a way to get user email - for now use a placeholder
          return {
            ...orgUser,
            user_email: `user-${orgUser.user_id.slice(0, 8)}@example.com`, // Placeholder
            user_created_at: orgUser.created_at
          };
        })
      );

      setUsers(usersWithEmails);

      // Load invitations
      const { data: inviteData, error: inviteError } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (inviteError) throw inviteError;
      setInvitations(inviteData || []);

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

  const handleSendInvitation = async () => {
    if (!inviteEmail || !currentOrganization) {
      toast({
        title: "Error",
        description: "El email es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if there's an existing invitation and delete it first
      const { error: deleteError } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('organization_id', currentOrganization.id)
        .eq('email', inviteEmail.trim().toLowerCase())
        .eq('used_at', null); // Only delete unused invitations

      if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.warn('Error deleting existing invitation:', deleteError);
      }

      // Create new invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: currentOrganization.id,
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          created_by: user?.id
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          invitation_id: invitation.id,
          email: inviteEmail.trim().toLowerCase(),
          organization_name: currentOrganization.name,
          role: inviteRole
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        toast({
          title: "Invitación creada",
          description: "La invitación se creó pero hubo un problema enviando el email",
          variant: "default",
        });
      } else {
        toast({
          title: "Invitación enviada",
          description: `Se envió una invitación a ${inviteEmail}`,
        });
      }

      setInviteEmail('');
      setInviteRole('user');
      setInviteDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación",
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

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitación eliminada",
        description: "La invitación ha sido eliminada",
      });

      loadData();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la invitación",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (invitation: Invitation) => {
    if (invitation.used_at) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Aceptada</Badge>;
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expirada</Badge>;
    }
    
    return <Badge variant="secondary">Pendiente</Badge>;
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
            
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Mail className="w-4 h-4 mr-2" />
                  Invitar Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invitar Usuario a {currentOrganization.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">Email</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteRole">Rol</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
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
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSendInvitation}>
                      Enviar Invitación
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

          {/* Invitations Table */}
          {invitations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Invitaciones Pendientes</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Enviada</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {invitation.role === 'admin' ? 'Administrador' : 'Usuario'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(invitation)}</TableCell>
                        <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvitation(invitation.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

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
                {invitations.filter(i => !i.used_at && new Date(i.expires_at) > new Date()).length}
              </p>
              <p className="text-sm text-muted-foreground">Invitaciones Pendientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, UserPlus, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  organization_id: string;
  created_by: string;
}

export const InvitationManager: React.FC = () => {
  const { currentOrganization, isAdmin } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (user && currentOrganization) {
        const hasAccess = await isAdmin();
        setHasAdminAccess(hasAccess);
        if (hasAccess) {
          loadInvitations();
        }
      }
    };
    checkAdminAccess();
  }, [currentOrganization, user]);

  const loadInvitations = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las invitaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim() || !currentOrganization) {
      toast({
        title: "Error",
        description: "El email es requerido",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create invitation
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
        // Don't fail the whole operation if email fails
        toast({
          title: "Invitación creada",
          description: "La invitación se creó pero hubo un problema enviando el email. Puedes reenviarla desde la lista.",
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
      setIsInviteDialogOpen(false);
      loadInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "Ya existe una invitación pendiente para este email",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar la invitación",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitación eliminada",
        description: "La invitación ha sido eliminada",
      });

      loadInvitations();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la invitación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          invitation_id: invitation.id,
          email: invitation.email,
          organization_name: currentOrganization?.name,
          role: invitation.role
        }
      });

      if (error) throw error;

      toast({
        title: "Invitación reenviada",
        description: `Se reenvió la invitación a ${invitation.email}`,
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo reenviar la invitación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  if (!currentOrganization || !hasAdminAccess) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sin acceso</h3>
          <p className="text-muted-foreground">
            Solo los administradores pueden gestionar invitaciones
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invitaciones</h2>
          <p className="text-muted-foreground">Invita usuarios a {currentOrganization.name}</p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Enviar Invitación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email del usuario</Label>
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
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={sendInvitation} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Invitación'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invitaciones Enviadas</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No hay invitaciones</h3>
              <p className="text-muted-foreground">
                Comienza invitando usuarios a tu organización
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviada</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
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
                    <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!invitation.used_at && new Date(invitation.expires_at) > new Date() && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resendInvitation(invitation)}
                            disabled={loading}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteInvitation(invitation.id)}
                          disabled={loading}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
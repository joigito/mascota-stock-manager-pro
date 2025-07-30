import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InvitationData {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  used_at: string | null;
  organization: {
    id: string;
    name: string;
    description?: string;
  };
}

export const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      loadInvitation();
    } else {
      setLoading(false);
      toast({
        title: "Error",
        description: "Token de invitación no válido",
        variant: "destructive",
      });
    }
  }, [token]);

  useEffect(() => {
    if (user && invitation) {
      // User is already logged in, accept invitation directly
      acceptInvitation();
    }
  }, [user, invitation]);

  const loadInvitation = async () => {
    if (!token) return;

    try {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select(`
          *,
          organization:organizations(id, name, description)
        `)
        .eq('token', token)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Error",
          description: "Invitación no encontrada",
          variant: "destructive",
        });
        return;
      }

      if (data.used_at) {
        toast({
          title: "Invitación ya utilizada",
          description: "Esta invitación ya ha sido aceptada",
          variant: "destructive",
        });
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        toast({
          title: "Invitación expirada",
          description: "Esta invitación ha expirado",
          variant: "destructive",
        });
        return;
      }

      setInvitation(data);
      setEmail(data.email);
    } catch (error) {
      console.error('Error loading invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la invitación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!invitation) return;

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      const { error } = await signUp(email, password);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Cuenta creada",
        description: "Revisa tu email para confirmar tu cuenta y luego regresa para aceptar la invitación",
      });
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setProcessing(true);
      const { error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      // After successful sign in, acceptInvitation will be called by useEffect
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const acceptInvitation = async () => {
    if (!invitation || !user) return;

    try {
      setProcessing(true);

      // Add user to organization
      const { error: memberError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: user.id,
          organization_id: invitation.organization.id,
          role: invitation.role
        });

      if (memberError) throw memberError;

      // Mark invitation as used
      const { error: updateError } = await supabase
        .from('organization_invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      toast({
        title: "¡Bienvenido!",
        description: `Te has unido exitosamente a ${invitation.organization.name}`,
      });

      // Redirect to main app
      navigate('/');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Ya eres miembro",
          description: "Ya perteneces a esta organización",
        });
        navigate('/');
      } else {
        toast({
          title: "Error",
          description: "No se pudo aceptar la invitación",
          variant: "destructive",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
            <p>Cargando invitación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Invitación no válida</h3>
            <p className="text-muted-foreground mb-4">
              Esta invitación no existe, ha expirado o ya ha sido utilizada
            </p>
            <Button onClick={() => navigate('/auth')}>
              Ir al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Aceptando invitación...</h3>
            <p className="text-muted-foreground">
              Te estamos agregando a {invitation.organization.name}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Invitación a Organización</CardTitle>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Has sido invitado a unirte a
            </p>
            <h3 className="text-xl font-semibold">{invitation.organization.name}</h3>
            {invitation.organization.description && (
              <p className="text-sm text-muted-foreground">
                {invitation.organization.description}
              </p>
            )}
            <Badge variant="outline">
              Rol: {invitation.role === 'admin' ? 'Administrador' : 'Usuario'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isNewUser ? "Crea una contraseña" : "Tu contraseña"}
              />
            </div>

            {isNewUser && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={isNewUser ? handleSignUp : handleSignIn}
              disabled={processing}
              className="w-full"
            >
              {processing ? (
                'Procesando...'
              ) : isNewUser ? (
                'Crear cuenta y unirse'
              ) : (
                'Iniciar sesión y unirse'
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setIsNewUser(!isNewUser)}
              className="w-full"
              disabled={processing}
            >
              {isNewUser ? 
                '¿Ya tienes cuenta? Inicia sesión' : 
                '¿No tienes cuenta? Crea una'
              }
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Esta invitación expira el {new Date(invitation.expires_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
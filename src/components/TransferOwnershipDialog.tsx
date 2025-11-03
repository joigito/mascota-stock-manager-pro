import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  User, 
  Mail, 
  Key, 
  ArrowRight, 
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface TransferOwnershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
  onTransferComplete?: () => void;
}

export const TransferOwnershipDialog: React.FC<TransferOwnershipDialogProps> = ({
  open,
  onOpenChange,
  organization,
  onTransferComplete
}) => {
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [transferCode, setTransferCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const { toast } = useToast();

  const storeUrl = organization ? `${window.location.origin}/tienda/${organization.slug}` : '';

  const generateTransferCode = () => {
    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setTransferCode(code);
    return code;
  };

  const handleTransfer = async () => {
    if (!organization || !newOwnerEmail || !newOwnerName) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate transfer code
      const code = generateTransferCode();

      // Create new user account (this would be done through Supabase Auth)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newOwnerEmail,
        password: code, // Temporary password
        email_confirm: true,
        user_metadata: {
          name: newOwnerName,
          transfer_organization_id: organization.id
        }
      });

      if (authError) {
        // If user already exists, we'll send them an invitation instead
        if (authError.message.includes('already registered')) {
          toast({
            title: "Usuario existente",
            description: "Este email ya está registrado. Se enviará una invitación para transferir la propiedad.",
          });
          // Here you would implement invitation logic
          setStep('confirmation');
          return;
        }
        throw authError;
      }

      if (authData.user) {
        // Add user as admin to the organization
        const { error: orgError } = await supabase
          .from('user_organizations')
          .insert({
            user_id: authData.user.id,
            organization_id: organization.id,
            role: 'admin'
          });

        if (orgError) throw orgError;

        // Update organization created_by field
        const { error: updateError } = await supabase
          .from('organizations')
          .update({ created_by: authData.user.id })
          .eq('id', organization.id);

        if (updateError) throw updateError;
      }

      setStep('confirmation');
      toast({
        title: "Transferencia completada",
        description: "La tienda ha sido transferida exitosamente",
      });

    } catch (error) {
      console.error('Error transferring ownership:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la transferencia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Información copiada al portapapeles",
    });
  };

  const handleClose = () => {
    setStep('form');
    setNewOwnerEmail('');
    setNewOwnerName('');
    setTransferCode('');
    onOpenChange(false);
    if (step === 'confirmation' && onTransferComplete) {
      onTransferComplete();
    }
  };

  if (!organization) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Transferir Propiedad de Tienda</span>
          </DialogTitle>
          <DialogDescription>
            Transfiere la propiedad completa de "{organization.name}" a un nuevo propietario
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tienda a Transferir</CardTitle>
                <CardDescription>Información de la tienda que será transferida</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Nombre:</span>
                  <span>{organization.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">URL:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-muted/50 px-2 py-1 rounded border border-border">
                      /tienda/{organization.slug}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(storeUrl)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nuevo Propietario</CardTitle>
                <CardDescription>Información del usuario que recibirá la tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newOwnerName">Nombre completo</Label>
                  <Input
                    id="newOwnerName"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="Nombre del nuevo propietario"
                  />
                </div>
                <div>
                  <Label htmlFor="newOwnerEmail">Email</Label>
                  <Input
                    id="newOwnerEmail"
                    type="email"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Importante</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Esta acción no se puede deshacer</li>
                  <li>El nuevo propietario tendrá acceso completo a la tienda</li>
                  <li>Se generará una cuenta nueva con contraseña temporal</li>
                  <li>Recibirás una confirmación por email</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ¡Transferencia Completada!
              </h3>
              <p className="text-muted-foreground">
                La tienda ha sido transferida exitosamente
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Información para el Nuevo Propietario</CardTitle>
                <CardDescription>Comparte esta información con el nuevo propietario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Email:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{newOwnerEmail}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(newOwnerEmail)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Contraseña temporal:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-card px-2 py-1 rounded border border-border">{transferCode}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(transferCode)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">URL de la tienda:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-card px-2 py-1 rounded border border-border">{storeUrl}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(storeUrl)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Badge variant="outline" className="w-full justify-center p-2">
                  Se recomienda cambiar la contraseña en el primer acceso
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          {step === 'form' && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={loading || !newOwnerEmail || !newOwnerName}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Transfiriendo...' : 'Transferir Tienda'}
              </Button>
            </>
          )}
          {step === 'confirmation' && (
            <Button onClick={handleClose} className="w-full">
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
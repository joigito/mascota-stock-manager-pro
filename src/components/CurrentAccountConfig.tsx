import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const CurrentAccountConfig = ({ organizationId }: { organizationId?: string }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organizationId) {
      loadCurrentAccountStatus();
    }
  }, [organizationId]);

  const loadCurrentAccountStatus = async () => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('current_account_enabled')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      setIsEnabled(data?.current_account_enabled || false);
    } catch (error) {
      console.error('Error loading current account status:', error);
    }
  };

  const toggleCurrentAccount = async (enabled: boolean) => {
    if (!organizationId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ current_account_enabled: enabled })
        .eq('id', organizationId);

      if (error) {
        toast.error('Error al actualizar configuración');
        console.error('Error updating organization:', error);
        return;
      }

      setIsEnabled(enabled);
      toast.success(
        enabled 
          ? 'Cuenta corriente habilitada' 
          : 'Cuenta corriente deshabilitada'
      );
    } catch (error) {
      toast.error('Error al actualizar configuración');
      console.error('Error updating organization:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Cuenta Corriente</CardTitle>
            </div>
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? 'Habilitada' : 'Deshabilitada'}
            </Badge>
          </div>
          <CardDescription>
            Sistema de gestión de deudas y pagos de clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Habilitar cuenta corriente</Label>
              <p className="text-sm text-muted-foreground">
                Permite llevar control de deudas y pagos de clientes
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={toggleCurrentAccount}
              disabled={loading}
            />
          </div>

          {isEnabled && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Funcionalidades incluidas:</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Registro automático de ventas a crédito</li>
                <li>Seguimiento de pagos de clientes</li>
                <li>Historial completo de movimientos</li>
                <li>Límites de crédito configurables</li>
                <li>Reportes de deudores</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export const CurrentAccountConfig = ({ organizationId }: { organizationId?: string }) => {
  const { isEnabled, toggle, loading } = useFeatureFlag('current_account', organizationId);

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
              onCheckedChange={toggle}
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

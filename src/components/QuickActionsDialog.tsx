import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Database, Activity, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'system' | 'users' | 'backup' | null;
}

export const QuickActionsDialog: React.FC<QuickActionsDialogProps> = ({
  open,
  onOpenChange,
  actionType
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(true);
    
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Acción completada",
      description: `${action} ejecutado correctamente`,
    });
    
    setLoading(false);
    onOpenChange(false);
  };

  const getContent = () => {
    switch (actionType) {
      case 'system':
        return {
          title: 'Configuración del Sistema',
          description: 'Administra la configuración global del sistema',
          icon: <Settings className="h-6 w-6" />,
          actions: [
            { label: 'Configurar notificaciones', action: 'Configuración de notificaciones' },
            { label: 'Ajustar parámetros de stock', action: 'Ajuste de parámetros de stock' },
            { label: 'Configurar integraciones', action: 'Configuración de integraciones' },
            { label: 'Gestionar plantillas', action: 'Gestión de plantillas' }
          ]
        };
      case 'users':
        return {
          title: 'Gestionar Roles de Usuario',
          description: 'Administra los roles y permisos de usuarios',
          icon: <Users className="h-6 w-6" />,
          actions: [
            { label: 'Asignar roles de administrador', action: 'Asignación de roles de administrador' },
            { label: 'Revisar permisos por tienda', action: 'Revisión de permisos por tienda' },
            { label: 'Suspender usuarios', action: 'Suspensión de usuarios' },
            { label: 'Auditoría de actividades', action: 'Auditoría de actividades' }
          ]
        };
      case 'backup':
        return {
          title: 'Respaldos de Base de Datos',
          description: 'Gestiona los respaldos y restauraciones',
          icon: <Database className="h-6 w-6" />,
          actions: [
            { label: 'Crear respaldo manual', action: 'Creación de respaldo manual' },
            { label: 'Programar respaldos automáticos', action: 'Programación de respaldos automáticos' },
            { label: 'Restaurar desde respaldo', action: 'Restauración desde respaldo' },
            { label: 'Verificar integridad de datos', action: 'Verificación de integridad de datos' }
          ]
        };
      default:
        return null;
    }
  };

  const content = getContent();

  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {content.icon}
            <span>{content.title}</span>
          </DialogTitle>
          <DialogDescription>
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span>Funcionalidad en Desarrollo</span>
              </CardTitle>
              <CardDescription>
                Esta sección estará disponible en próximas versiones del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {content.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleAction(action.action)}
                    disabled={loading}
                  >
                    <Activity className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-sm text-muted-foreground">
                        Próximamente disponible
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
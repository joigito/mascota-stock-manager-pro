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
import { UserManagement } from '@/components/UserManagement';
import { SystemConfigurationDialog } from '@/components/SystemConfigurationDialog';
import { DatabaseBackupManager } from '@/components/DatabaseBackupManager';
import VariantAttributeManager from './VariantAttributeManager';
import { useOrganization } from '@/hooks/useOrganization';

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
                        const [systemConfigOpen, setSystemConfigOpen] = useState(false);
                        const { currentOrganization } = useOrganization();
                        const [openAttr, setOpenAttr] = useState(false);

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

                        // Users modal
                        if (actionType === 'users') {
                          return (
                            <>
                              <Dialog open={open} onOpenChange={onOpenChange}>
                                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center space-x-2">
                                      <Users className="h-5 w-5" />
                                      <span>Gestión de Roles de Usuario</span>
                                    </DialogTitle>
                                    <DialogDescription>
                                      Administra roles globales y de organizaciones para todos los usuarios del sistema
                                    </DialogDescription>
                                  </DialogHeader>
                                  <UserManagement />
                                </DialogContent>
                              </Dialog>
                              <VariantAttributeManager
                                organizationId={currentOrganization?.id}
                                open={openAttr}
                                onClose={() => setOpenAttr(false)}
                              />
                            </>
                          );
                        }

                        // System modal
                        if (actionType === 'system') {
                          return (
                            <>
                              <Dialog open={open} onOpenChange={onOpenChange}>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center space-x-2">
                                      <Settings className="h-6 w-6" />
                                      <span>Configuración del Sistema</span>
                                    </DialogTitle>
                                    <DialogDescription>
                                      Administra los parámetros globales para adaptar el sistema a cualquier rubro
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="space-y-4">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                          <Settings className="h-5 w-5 text-blue-500" />
                                          <span>Parámetros Globales de Stock</span>
                                        </CardTitle>
                                        <CardDescription>
                                          Configura categorías, unidades de medida, stock mínimo y márgenes por categoría
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                        <Button
                                          onClick={() => {
                                            setSystemConfigOpen(true);
                                            onOpenChange(false);
                                          }}
                                          className="w-full"
                                        >
                                          <Settings className="h-4 w-4 mr-2" />
                                          Abrir Configuración Avanzada
                                        </Button>
                                        <p className="text-sm text-muted-foreground mt-2">
                                          Haz que tu sistema se adapte a cualquier rubro: alimentación, electrónica, ropa, servicios y más.
                                        </p>
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                          <AlertCircle className="h-5 w-5 text-amber-500" />
                                          <span>Próximas Funcionalidades</span>
                                        </CardTitle>
                                        <CardDescription>
                                          Estas funciones estarán disponibles en futuras versiones
                                        </CardDescription>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid gap-3">
                                          {content.actions.slice(1).map((action, index) => (
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

                              <SystemConfigurationDialog 
                                open={systemConfigOpen} 
                                onOpenChange={setSystemConfigOpen} 
                              />

                              <VariantAttributeManager
                                organizationId={currentOrganization?.id}
                                open={openAttr}
                                onClose={() => setOpenAttr(false)}
                              />
                            </>
                          );
                        }

                        // Backup modal
                        if (actionType === 'backup') {
                          return (
                            <>
                              <Dialog open={open} onOpenChange={onOpenChange}>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center space-x-2">
                                      <Database className="h-5 w-5" />
                                      <span>Gestión de Respaldos de Base de Datos</span>
                                    </DialogTitle>
                                    <DialogDescription>
                                      Crea respaldos manuales y restaura la base de datos desde archivos de respaldo
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DatabaseBackupManager />
                                </DialogContent>
                              </Dialog>

                              <VariantAttributeManager
                                organizationId={currentOrganization?.id}
                                open={openAttr}
                                onClose={() => setOpenAttr(false)}
                              />
                            </>
                          );
                        }

                        // Default content
                        return (
                          <>
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

                                        {/* Quick access to Variant Attributes for the selected organization */}
                                        <Button
                                          variant="outline"
                                          className="justify-start h-auto p-4"
                                          onClick={() => setOpenAttr(true)}
                                          disabled={!currentOrganization}
                                        >
                                          <Activity className="h-4 w-4 mr-3" />
                                          <div className="text-left">
                                            <div className="font-medium">Atributos</div>
                                            <div className="text-sm text-muted-foreground">Gestionar atributos de variantes por tienda</div>
                                          </div>
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <VariantAttributeManager
                              organizationId={currentOrganization?.id}
                              open={openAttr}
                              onClose={() => setOpenAttr(false)}
                            />
                          </>
                        );
};

export default QuickActionsDialog;
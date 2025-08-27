import { useState } from 'react';
import { useElectronicInvoicing } from '@/hooks/useElectronicInvoicing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Settings, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ElectronicInvoicingConfig = ({ organizationId }: { organizationId?: string }) => {
  const {
    isEnabled,
    afipConfig,
    loading,
    targetOrganization,
    toggleElectronicInvoicing,
    saveAFIPConfiguration
  } = useElectronicInvoicing(organizationId);

  const [formData, setFormData] = useState({
    cuit: afipConfig?.cuit || '',
    razon_social: afipConfig?.razon_social || '',
    punto_venta: afipConfig?.punto_venta || 1,
    condicion_iva: afipConfig?.condicion_iva || 'responsable_inscripto',
    domicilio_comercial: afipConfig?.domicilio_comercial || '',
    ambiente: afipConfig?.ambiente || 'testing'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAFIPConfiguration({
      ...formData,
      is_active: true,
      certificado_path: '', // Se configurará por separado
      clave_privada_path: '' // Se configurará por separado
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Estado general */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Facturación Electrónica</CardTitle>
            </div>
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? 'Habilitada' : 'Deshabilitada'}
            </Badge>
          </div>
          <CardDescription>
            Configuración de facturación electrónica AFIP/ARCA para esta organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Habilitar facturación electrónica</Label>
              <p className="text-sm text-muted-foreground">
                Permite generar facturas electrónicas válidas para AFIP
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={toggleElectronicInvoicing}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advertencia si está habilitada pero no configurada */}
      {isEnabled && !afipConfig && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            La facturación electrónica está habilitada pero falta configurar los datos de AFIP.
            Complete la configuración para comenzar a emitir facturas.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuración AFIP */}
      {isEnabled && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Configuración AFIP</CardTitle>
            </div>
            <CardDescription>
              Datos fiscales y configuración para la integración con AFIP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cuit">CUIT *</Label>
                  <Input
                    id="cuit"
                    type="text"
                    placeholder="20-12345678-9"
                    value={formData.cuit}
                    onChange={(e) => handleInputChange('cuit', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="punto_venta">Punto de Venta *</Label>
                  <Input
                    id="punto_venta"
                    type="number"
                    min="1"
                    max="9999"
                    value={formData.punto_venta}
                    onChange={(e) => handleInputChange('punto_venta', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="razon_social">Razón Social *</Label>
                <Input
                  id="razon_social"
                  type="text"
                  placeholder="Nombre completo de la empresa"
                  value={formData.razon_social}
                  onChange={(e) => handleInputChange('razon_social', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condicion_iva">Condición IVA *</Label>
                  <Select
                    value={formData.condicion_iva}
                    onValueChange={(value) => handleInputChange('condicion_iva', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="responsable_inscripto">Responsable Inscripto</SelectItem>
                      <SelectItem value="monotributo">Monotributo</SelectItem>
                      <SelectItem value="exento">Exento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ambiente">Ambiente *</Label>
                  <Select
                    value={formData.ambiente}
                    onValueChange={(value) => handleInputChange('ambiente', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="testing">Testing (Pruebas)</SelectItem>
                      <SelectItem value="production">Producción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domicilio_comercial">Domicilio Comercial</Label>
                <Textarea
                  id="domicilio_comercial"
                  placeholder="Dirección del domicilio comercial"
                  value={formData.domicilio_comercial}
                  onChange={(e) => handleInputChange('domicilio_comercial', e.target.value)}
                  rows={2}
                />
              </div>

              {formData.ambiente === 'testing' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Está configurado en modo de pruebas. Las facturas generadas no tendrán validez fiscal.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Estado de la configuración */}
      {isEnabled && afipConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Configuración Completada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>CUIT: {afipConfig.cuit}</p>
              <p>Punto de Venta: {afipConfig.punto_venta}</p>
              <p>Ambiente: {afipConfig.ambiente === 'testing' ? 'Pruebas' : 'Producción'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
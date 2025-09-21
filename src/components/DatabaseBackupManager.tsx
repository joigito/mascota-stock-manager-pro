import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  FileText,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BackupSummary {
  timestamp: string;
  tables: number;
  totalRecords: number;
  tableStats: Array<{
    table: string;
    count: number;
  }>;
}

export const DatabaseBackupManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [lastBackup, setLastBackup] = useState<BackupSummary | null>(null);
  const [restoreResults, setRestoreResults] = useState<any>(null);

  const createBackup = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      toast({
        title: "Iniciando respaldo",
        description: "Generando respaldo de la base de datos...",
      });

      setProgress(25);

      const { data, error } = await supabase.functions.invoke('database-backup', {
        body: { action: 'create-backup' }
      });

      if (error) {
        throw new Error(error.message);
      }

      setProgress(75);

      if (data.success) {
        // Create downloadable file
        const backupBlob = new Blob([JSON.stringify(data.backup, null, 2)], {
          type: 'application/json'
        });
        
        const url = URL.createObjectURL(backupBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setLastBackup(data.summary);
        setProgress(100);

        toast({
          title: "Respaldo completado",
          description: `Se generó un respaldo con ${data.summary.totalRecords} registros de ${data.summary.tables} tablas`,
        });
      } else {
        throw new Error('Error creating backup');
      }
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Error en el respaldo",
        description: error.message || "No se pudo crear el respaldo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setBackupFile(file);
        setRestoreResults(null);
      } else {
        toast({
          title: "Archivo inválido",
          description: "Por favor selecciona un archivo JSON de respaldo",
          variant: "destructive",
        });
      }
    }
  };

  const restoreBackup = async () => {
    if (!backupFile) {
      toast({
        title: "No hay archivo",
        description: "Por favor selecciona un archivo de respaldo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      toast({
        title: "Iniciando restauración",
        description: "⚠️ ADVERTENCIA: Esto reemplazará todos los datos actuales",
      });

      setProgress(25);

      const fileContent = await backupFile.text();
      const backupData = JSON.parse(fileContent);

      setProgress(50);

      const { data, error } = await supabase.functions.invoke('database-backup', {
        body: { 
          action: 'restore-backup',
          backupData: backupData
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setProgress(90);
      setRestoreResults(data);

      if (data.success) {
        setProgress(100);
        toast({
          title: "Restauración completada",
          description: `Se restauraron ${data.summary.totalRestored} registros exitosamente`,
        });
      } else {
        toast({
          title: "Restauración con errores",
          description: `Se completó con ${data.summary.errorsCount} errores`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: "Error en la restauración",
        description: error.message || "No se pudo restaurar el respaldo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      {loading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Procesando...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Create Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-blue-500" />
            <span>Crear Respaldo Manual</span>
          </CardTitle>
          <CardDescription>
            Genera un respaldo completo de toda la base de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              El respaldo incluirá todas las organizaciones, productos, ventas, usuarios y configuraciones del sistema.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={createBackup} 
            disabled={loading}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Generando respaldo...' : 'Crear Respaldo Ahora'}
          </Button>

          {lastBackup && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Último respaldo exitoso</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><Clock className="h-3 w-3 inline mr-1" /> {new Date(lastBackup.timestamp).toLocaleString()}</p>
                <p><Database className="h-3 w-3 inline mr-1" /> {lastBackup.tables} tablas, {lastBackup.totalRecords} registros</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-orange-500" />
            <span>Restaurar desde Respaldo</span>
          </CardTitle>
          <CardDescription>
            Restaura la base de datos desde un archivo de respaldo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-orange-700">
              <strong>⚠️ PELIGRO:</strong> Esta acción reemplazará TODOS los datos actuales de la base de datos. 
              Asegúrate de tener un respaldo actual antes de proceder.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="backup-file">Seleccionar archivo de respaldo (.json)</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              disabled={loading}
            />
          </div>

          {backupFile && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">{backupFile.name}</span>
                <span className="text-xs text-blue-600">
                  ({(backupFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={restoreBackup}
            disabled={loading || !backupFile}
            variant="destructive"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Restaurando...' : 'Restaurar Base de Datos'}
          </Button>

          {restoreResults && (
            <div className={`p-4 border rounded-lg ${
              restoreResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {restoreResults.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-medium ${
                  restoreResults.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {restoreResults.success ? 'Restauración exitosa' : 'Restauración con errores'}
                </span>
              </div>
              <div className={`text-sm space-y-1 ${
                restoreResults.success ? 'text-green-700' : 'text-red-700'
              }`}>
                <p>Registros restaurados: {restoreResults.summary.totalRestored}</p>
                <p>Tablas procesadas: {restoreResults.summary.tablesProcessed}</p>
                {restoreResults.summary.errorsCount > 0 && (
                  <p>Errores: {restoreResults.summary.errorsCount}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-500" />
            <span>Información del Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• Los respaldos incluyen todas las tablas principales del sistema</p>
          <p>• Formato de archivo: JSON</p>
          <p>• La restauración elimina todos los datos existentes antes de importar</p>
          <p>• Recomendado: Crear respaldos regularmente antes de cambios importantes</p>
        </CardContent>
      </Card>
    </div>
  );
};
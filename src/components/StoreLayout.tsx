import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PawPrint, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface StoreLayoutProps {
  organization: Organization;
  children: React.ReactNode;
}

export const StoreLayout: React.FC<StoreLayoutProps> = ({ organization, children }) => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-orange-500 rounded-xl shadow-lg">
                <PawPrint className="h-6 w-6 sm:h-10 sm:w-10 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                  {organization.name}
                </h1>
                <p className="text-xs sm:text-base text-gray-600">
                  {organization.description || 'Gestión de inventario para mascotas y forrajería'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <Badge variant="outline" className="border-green-300 text-green-700">
                <PawPrint className="h-3 w-3 mr-1" />
                Tienda Independiente
              </Badge>
              <Link to="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Volver al Sistema</span>
                  <span className="sm:hidden">Volver</span>
                </Button>
              </Link>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50 flex-1 sm:flex-none"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthPromptProps {
  onClose?: () => void;
  storeName?: string;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({ onClose, storeName }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    const currentUrl = window.location.pathname;
    navigate(`/auth?redirect=${encodeURIComponent(currentUrl)}`);
  };

  const handleSignup = () => {
    const currentUrl = window.location.pathname;
    // Store the current store URL for after registration
    localStorage.setItem('pendingStoreUrl', currentUrl);
    navigate(`/auth?redirect=${encodeURIComponent(currentUrl)}&tab=signup`);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <LogIn className="h-5 w-5" />
          Autenticación Requerida
        </CardTitle>
        <CardDescription>
          {storeName ? 
            `Para agregar productos a "${storeName}", necesitas iniciar sesión o crear una cuenta.` :
            'Para agregar productos, necesitas iniciar sesión o crear una cuenta.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleLogin} 
          className="w-full"
          variant="default"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Iniciar Sesión
        </Button>
        <Button 
          onClick={handleSignup} 
          className="w-full"
          variant="outline"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Crear Cuenta Nueva
        </Button>
        {onClose && (
          <Button 
            onClick={onClose} 
            className="w-full"
            variant="ghost"
          >
            Continuar Navegando
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
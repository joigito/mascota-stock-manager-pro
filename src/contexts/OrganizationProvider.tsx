import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

interface OrganizationProviderProps {
  children: React.ReactNode;
}

// This is a wrapper that provides both Auth and Organization contexts
export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
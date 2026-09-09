import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const UserIndicator: React.FC = () => {
  const { user } = useAuth();

  if (!user?.email) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 px-2 sm:px-3 py-1.5 bg-muted/50 rounded-lg">
      <User className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs sm:text-sm text-muted-foreground hidden lg:inline">
        {user.email}
      </span>
    </div>
  );
};
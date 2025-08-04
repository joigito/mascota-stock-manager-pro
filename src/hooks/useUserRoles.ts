import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  created_at: string;
  organization: {
    id: string;
    name: string;
    slug?: string;
  };
}

interface UserWithRoles {
  user: User;
  globalRoles: UserRole[];
  organizationRoles: UserOrganization[];
}

export const useUserRoles = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Get all users who have organization memberships
      const { data: userOrgData, error: userOrgError } = await supabase
        .from('user_organizations')
        .select(`
          user_id,
          organization_id,
          role,
          id,
          created_at,
          organization:organizations(id, name, slug)
        `);

      if (userOrgError) throw userOrgError;

      // Get all global user roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (userRolesError) throw userRolesError;

      // Get unique user IDs
      const userIds = Array.from(new Set(userOrgData?.map(uo => uo.user_id) || []));

      // Get user details from auth.users via a function call
      const usersWithRoles: UserWithRoles[] = [];

      for (const userId of userIds) {
        // Create a mock user object since we can't access auth.users directly
        const mockUser: User = {
          id: userId,
          email: `user-${userId.slice(0, 8)}@example.com`, // We'll need to get this differently
          created_at: new Date().toISOString(),
        };

        const globalRoles = userRolesData?.filter(ur => ur.user_id === userId) || [];
        const organizationRoles = userOrgData?.filter(uo => uo.user_id === userId) || [];

        usersWithRoles.push({
          user: mockUser,
          globalRoles,
          organizationRoles
        });
      }

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignGlobalRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role as 'super_admin' | 'admin' | 'user'
        });

      if (error) throw error;

      toast({
        title: "Rol asignado",
        description: `Rol ${role} asignado correctamente`,
      });

      await loadUsers();
    } catch (error) {
      console.error('Error assigning global role:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar el rol",
        variant: "destructive",
      });
    }
  };

  const removeGlobalRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as 'super_admin' | 'admin' | 'user');

      if (error) throw error;

      toast({
        title: "Rol removido",
        description: `Rol ${role} removido correctamente`,
      });

      await loadUsers();
    } catch (error) {
      console.error('Error removing global role:', error);
      toast({
        title: "Error",
        description: "No se pudo remover el rol",
        variant: "destructive",
      });
    }
  };

  const updateOrganizationRole = async (userId: string, organizationId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_organizations')
        .update({ role: newRole })
        .eq('user_id', userId)
        .eq('organization_id', organizationId);

      if (error) throw error;

      toast({
        title: "Rol actualizado",
        description: `Rol en organización actualizado a ${newRole}`,
      });

      await loadUsers();
    } catch (error) {
      console.error('Error updating organization role:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol en la organización",
        variant: "destructive",
      });
    }
  };

  const removeUserFromOrganization = async (userId: string, organizationId: string) => {
    try {
      const { error } = await supabase
        .from('user_organizations')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', organizationId);

      if (error) throw error;

      toast({
        title: "Usuario removido",
        description: "Usuario removido de la organización",
      });

      await loadUsers();
    } catch (error) {
      console.error('Error removing user from organization:', error);
      toast({
        title: "Error",
        description: "No se pudo remover el usuario de la organización",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    loadUsers,
    assignGlobalRole,
    removeGlobalRole,
    updateOrganizationRole,
    removeUserFromOrganization,
  };
};
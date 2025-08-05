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

      // Get real user data using secure function
      const { data: realUsersData, error: usersError } = await supabase
        .rpc('get_users_with_roles');

      if (usersError) throw usersError;

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

      // Create users with roles using real user data
      const usersWithRoles: UserWithRoles[] = [];

      if (realUsersData) {
        for (const userData of realUsersData) {
          const realUser: User = {
            id: userData.user_id,
            email: userData.email,
            created_at: userData.created_at,
            last_sign_in_at: userData.last_sign_in_at,
          };

          const globalRoles = userRolesData?.filter(ur => ur.user_id === userData.user_id) || [];
          const organizationRoles = userOrgData?.filter(uo => uo.user_id === userData.user_id) || [];

          usersWithRoles.push({
            user: realUser,
            globalRoles,
            organizationRoles
          });
        }
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
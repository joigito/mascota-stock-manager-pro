import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  created_at: string;
  organization: Organization;
}

export const useOrganization = () => {
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadUserOrganizations();
    }
  }, [user?.id]);

  const loadUserOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_organizations')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      setOrganizations(data || []);
      
      // Try to restore previously selected organization
      const savedOrgId = localStorage.getItem('selectedOrganizationId');
      if (savedOrgId && data) {
        const savedOrg = data.find(userOrg => userOrg.organization.id === savedOrgId);
        if (savedOrg) {
          setCurrentOrganization(savedOrg.organization);
        }
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las organizaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = (organization: Organization) => {
    setCurrentOrganization(organization);
    // Persist the selection in localStorage
    localStorage.setItem('selectedOrganizationId', organization.id);
  };

  const clearOrganization = () => {
    setCurrentOrganization(null);
    localStorage.removeItem('selectedOrganizationId');
  };

  const hasRole = (role: 'admin' | 'user') => {
    if (!currentOrganization) return false;
    
    const userOrg = organizations.find(
      org => org.organization_id === currentOrganization.id
    );
    
    return userOrg?.role === role || userOrg?.role === 'admin';
  };

  const isAdmin = () => hasRole('admin');

  const isSuperAdmin = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .single();
      
      return !error && !!data;
    } catch {
      return false;
    }
  };

  return {
    organizations,
    currentOrganization,
    loading,
    switchOrganization,
    clearOrganization,
    hasRole,
    isAdmin,
    isSuperAdmin,
    reload: loadUserOrganizations
  };
};
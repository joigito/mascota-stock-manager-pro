import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  current_account_enabled?: boolean;
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
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize immediately when component mounts if user exists
  useEffect(() => {
    if (user?.id && !initialized) {
      initializeOrganizations();
    }
  }, [user?.id, initialized]);

  const initializeOrganizations = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // First, try to restore from localStorage synchronously if available
      const savedOrgId = localStorage.getItem('selectedOrganizationId');
      
      // Check if user is super admin
      const isSuper = await isSuperAdmin();
      
      let allOrgsData: any[] = [];
      let userOrgsData: UserOrganization[] = [];

      if (isSuper) {
        // Super admins can see all organizations
        const { data: allOrgs, error: orgsError } = await supabase
          .from('organizations')
          .select('*');

        if (orgsError) throw orgsError;

        allOrgsData = allOrgs || [];

        // Transform to match the expected format
        const transformedData = allOrgsData.map(org => ({
          id: `super_admin_${org.id}`,
          user_id: user?.id || '',
          organization_id: org.id,
          role: 'super_admin',
          created_at: new Date().toISOString(),
          organization: org
        }));

        setOrganizations(transformedData);
        userOrgsData = transformedData;
      } else {
        // Regular users see only their organizations
        const { data, error } = await supabase
          .from('user_organizations')
          .select(`
            *,
            organization:organizations(*)
          `)
          .eq('user_id', user?.id);

        if (error) throw error;

        userOrgsData = data || [];
        setOrganizations(userOrgsData);
      }
      
      
      // Now handle organization selection with proper priority
      let organizationToSelect: Organization | null = null;
      
      // Priority 1: Restore from localStorage if valid
      if (savedOrgId) {
        const orgData = isSuper ? allOrgsData : userOrgsData.map(uo => uo.organization);
        const savedOrg = orgData.find(org => org.id === savedOrgId);
        
        if (savedOrg) {
          organizationToSelect = savedOrg;
        } else {
          localStorage.removeItem('selectedOrganizationId');
        }
      }
      
      // Priority 2: Auto-select if user has exactly one org and is not super admin
      if (!organizationToSelect && !isSuper && userOrgsData.length === 1) {
        organizationToSelect = userOrgsData[0].organization;
        localStorage.setItem('selectedOrganizationId', organizationToSelect.id);
      }
      
      // Set the organization immediately and synchronously
      if (organizationToSelect) {
        setCurrentOrganization(organizationToSelect);
      } else {
      }
      
    } catch (error) {
      console.error('Error initializing organizations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las organizaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const switchOrganization = (organization: Organization) => {
    
    // Set the organization immediately
    setCurrentOrganization(organization);
    
    // Persist the selection in localStorage
    localStorage.setItem('selectedOrganizationId', organization.id);
    
    
    // Show success notification
    toast({
      title: "Organización seleccionada",
      description: `Ahora estás trabajando en ${organization.name}`,
    });
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
    
    // Super admins have admin privileges everywhere
    if (userOrg?.role === 'super_admin') return true;
    
    return userOrg?.role === role || userOrg?.role === 'admin';
  };

  const isAdmin = async () => {
    // Super admins have admin privileges everywhere
    if (await isSuperAdmin()) return true;
    // Check organization-specific role from local state
    return hasRole('admin');
  };

  const isSuperAdmin = async () => {
    if (!user) {
      return false;
    }
    
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_roles')
        .returns<{ role: string }[]>();
      
      
      if (error) {
        console.error('Error checking super admin role:', error);
        return false;
      }
      
      const isSuper = data?.some(r => r.role === 'super_admin') || false;
      return isSuper;
    } catch (error) {
      console.error('Exception checking super admin role:', error);
      return false;
    }
  };

  return {
    organizations,
    currentOrganization,
    loading: loading || !initialized,
    switchOrganization,
    clearOrganization,
    hasRole,
    isAdmin,
    isSuperAdmin,
    reload: initializeOrganizations
  };
};
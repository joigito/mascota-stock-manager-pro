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
      // Check if user is super admin first
      const isSuper = await isSuperAdmin();
      console.log('loadUserOrganizations: Is super admin:', isSuper);
      
      if (isSuper) {
        // Super admins can see all organizations
        const { data: allOrgs, error: orgsError } = await supabase
          .from('organizations')
          .select('*');

        if (orgsError) throw orgsError;

        // Transform to match the expected format
        const transformedData = allOrgs?.map(org => ({
          id: `super_admin_${org.id}`,
          user_id: user?.id || '',
          organization_id: org.id,
          role: 'super_admin',
          created_at: new Date().toISOString(),
          organization: org
        })) || [];

        console.log('loadUserOrganizations: Super admin organizations:', transformedData);
        setOrganizations(transformedData);
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

        console.log('loadUserOrganizations: Regular user organizations:', data);
        setOrganizations(data || []);
      }
      
      // Try to restore previously selected organization
      const savedOrgId = localStorage.getItem('selectedOrganizationId');
      if (savedOrgId) {
        const allData = isSuper ? 
          (await supabase.from('organizations').select('*')).data || [] :
          organizations.map(uo => uo.organization);
        
        const savedOrg = allData.find(org => 
          isSuper ? org.id === savedOrgId : org.id === savedOrgId
        );
        
        if (savedOrg) {
          const orgToSet = isSuper ? savedOrg : savedOrg;
          setCurrentOrganization(orgToSet);
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
    console.log('switchOrganization: Setting organization:', organization);
    setCurrentOrganization(organization);
    // Persist the selection in localStorage
    localStorage.setItem('selectedOrganizationId', organization.id);
    
    // Force a page refresh to ensure the navigation happens properly
    setTimeout(() => {
      window.location.reload();
    }, 100);
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

  const isAdmin = async () => {
    // Super admins have admin privileges everywhere
    if (await isSuperAdmin()) return true;
    // Otherwise check organization-specific role
    return hasRole('admin');
  };

  const isSuperAdmin = async () => {
    if (!user) {
      console.log('isSuperAdmin: No user found');
      return false;
    }
    
    console.log('isSuperAdmin: Checking for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_roles')
        .returns<{ role: string }[]>();
      
      console.log('isSuperAdmin: RPC response:', { data, error });
      
      if (error) {
        console.error('Error checking super admin role:', error);
        return false;
      }
      
      const isSuper = data?.some(r => r.role === 'super_admin') || false;
      console.log('isSuperAdmin: Final result:', isSuper);
      return isSuper;
    } catch (error) {
      console.error('Exception checking super admin role:', error);
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
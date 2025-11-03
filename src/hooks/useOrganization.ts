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
      console.log('useOrganization: User loaded, initializing...');
      initializeOrganizations();
    }
  }, [user?.id, initialized]);

  const initializeOrganizations = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('initializeOrganizations: Starting initialization...');
      
      // First, try to restore from localStorage synchronously if available
      const savedOrgId = localStorage.getItem('selectedOrganizationId');
      console.log('initializeOrganizations: Saved organization ID:', savedOrgId);
      
      // Check if user is super admin
      const isSuper = await isSuperAdmin();
      console.log('initializeOrganizations: Is super admin:', isSuper);
      
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

        console.log('initializeOrganizations: Super admin organizations:', transformedData);
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
        console.log('initializeOrganizations: Regular user organizations:', userOrgsData);
        setOrganizations(userOrgsData);
      }
      
      console.log('initializeOrganizations: Organizations loaded, count:', userOrgsData.length);
      
      // Now handle organization selection with proper priority
      let organizationToSelect: Organization | null = null;
      
      // Priority 1: Restore from localStorage if valid
      if (savedOrgId) {
        const orgData = isSuper ? allOrgsData : userOrgsData.map(uo => uo.organization);
        const savedOrg = orgData.find(org => org.id === savedOrgId);
        
        if (savedOrg) {
          console.log('initializeOrganizations: Restoring saved organization:', savedOrg.name);
          organizationToSelect = savedOrg;
        } else {
          console.log('initializeOrganizations: Saved organization not found, clearing localStorage');
          localStorage.removeItem('selectedOrganizationId');
        }
      }
      
      // Priority 2: Auto-select if user has exactly one org and is not super admin
      if (!organizationToSelect && !isSuper && userOrgsData.length === 1) {
        organizationToSelect = userOrgsData[0].organization;
        console.log('initializeOrganizations: Auto-selecting single organization:', organizationToSelect.name);
        localStorage.setItem('selectedOrganizationId', organizationToSelect.id);
      }
      
      // Set the organization immediately and synchronously
      if (organizationToSelect) {
        setCurrentOrganization(organizationToSelect);
        console.log('initializeOrganizations: Organization set to:', organizationToSelect.name);
      } else {
        console.log('initializeOrganizations: No organization to select');
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
      console.log('initializeOrganizations: Initialization completed');
    }
  };

  const switchOrganization = (organization: Organization) => {
    console.log('switchOrganization: Setting organization:', organization);
    console.log('switchOrganization: Previous organization:', currentOrganization);
    
    // Set the organization immediately
    setCurrentOrganization(organization);
    
    // Persist the selection in localStorage
    localStorage.setItem('selectedOrganizationId', organization.id);
    
    console.log('switchOrganization: Organization set successfully');
    console.log('switchOrganization: New organization is:', organization.name);
    
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
    loading: loading || !initialized,
    switchOrganization,
    clearOrganization,
    hasRole,
    isAdmin,
    isSuperAdmin,
    reload: initializeOrganizations
  };
};
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
      console.log('useOrganization: User loaded, loading organizations...');
      loadUserOrganizations();
    }
  }, [user?.id]);

  const loadUserOrganizations = async () => {
    try {
      // Check if user is super admin first
      const isSuper = await isSuperAdmin();
      console.log('loadUserOrganizations: Is super admin:', isSuper);
      
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

        console.log('loadUserOrganizations: Super admin organizations:', transformedData);
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
        console.log('loadUserOrganizations: Regular user organizations:', userOrgsData);
        setOrganizations(userOrgsData);
      }
      
      console.log('loadUserOrganizations: Organizations count:', userOrgsData.length);
      console.log('loadUserOrganizations: Is super admin:', isSuper);
      
      // Try to restore previously selected organization first
      const savedOrgId = localStorage.getItem('selectedOrganizationId');
      console.log('loadUserOrganizations: Saved organization ID:', savedOrgId);
      
      if (savedOrgId) {
        const orgData = isSuper ? allOrgsData : userOrgsData.map(uo => uo.organization);
        const savedOrg = orgData.find(org => org.id === savedOrgId);
        
        if (savedOrg) {
          console.log('loadUserOrganizations: Restoring saved organization:', savedOrg.name);
          setCurrentOrganization(savedOrg);
          return; // Exit early to prevent auto-selection override
        } else {
          console.log('loadUserOrganizations: Saved organization not found, clearing localStorage');
          localStorage.removeItem('selectedOrganizationId');
        }
      }
      
      // Auto-select organization if user has exactly one and is not super admin (only if no saved org)
      if (!isSuper && userOrgsData.length === 1) {
        const singleOrg = userOrgsData[0].organization;
        console.log('loadUserOrganizations: Auto-selecting single organization:', singleOrg.name);
        setCurrentOrganization(singleOrg);
        localStorage.setItem('selectedOrganizationId', singleOrg.id);
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
    loading,
    switchOrganization,
    clearOrganization,
    hasRole,
    isAdmin,
    isSuperAdmin,
    reload: loadUserOrganizations
  };
};
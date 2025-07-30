import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useStoreSlug = (slug?: string) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      loadOrganizationBySlug(slug);
    } else {
      setLoading(false);
    }
  }, [slug]);

  const loadOrganizationBySlug = async (organizationSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', organizationSlug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Tienda no encontrada');
          toast({
            title: "Tienda no encontrada",
            description: `No se encontró una tienda con la URL "${organizationSlug}"`,
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setOrganization(data);
    } catch (error) {
      console.error('Error loading organization by slug:', error);
      setError('Error al cargar la tienda');
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la tienda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    organization,
    loading,
    error,
    reload: () => slug && loadOrganizationBySlug(slug)
  };
};
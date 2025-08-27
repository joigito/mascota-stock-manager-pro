import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { toast } from 'sonner';

interface AFIPConfiguration {
  id: string;
  organization_id: string;
  cuit: string;
  punto_venta: number;
  razon_social: string;
  condicion_iva: string;
  domicilio_comercial?: string;
  ambiente: string;
  certificado_path?: string;
  clave_privada_path?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TaxCondition {
  code: string;
  description: string;
  requires_cuit: boolean;
  is_active: boolean;
}

export const useElectronicInvoicing = (organizationId?: string) => {
  const { currentOrganization } = useOrganization();
  const [afipConfig, setAfipConfig] = useState<AFIPConfiguration | null>(null);
  const [taxConditions, setTaxConditions] = useState<TaxCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [targetOrganization, setTargetOrganization] = useState<any>(null);

  const activeOrganizationId = organizationId || currentOrganization?.id;

  useEffect(() => {
    if (activeOrganizationId) {
      loadOrganizationData();
      loadAFIPConfiguration();
      loadTaxConditions();
    }
  }, [activeOrganizationId]);

  const loadOrganizationData = async () => {
    if (!activeOrganizationId) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', activeOrganizationId)
        .single();

      if (error) {
        console.error('Error loading organization:', error);
        return;
      }

      setTargetOrganization(data);
      setIsEnabled(data?.electronic_invoicing_enabled || false);
    } catch (error) {
      console.error('Error loading organization:', error);
    }
  };

  const loadAFIPConfiguration = async () => {
    if (!activeOrganizationId) return;

    try {
      const { data, error } = await supabase
        .from('afip_configurations')
        .select('*')
        .eq('organization_id', activeOrganizationId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading AFIP configuration:', error);
        return;
      }

      setAfipConfig(data);
    } catch (error) {
      console.error('Error loading AFIP configuration:', error);
    }
  };

  const loadTaxConditions = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_conditions')
        .select('*')
        .eq('is_active', true)
        .order('description');

      if (error) {
        console.error('Error loading tax conditions:', error);
        return;
      }

      setTaxConditions(data || []);
    } catch (error) {
      console.error('Error loading tax conditions:', error);
    }
  };

  const toggleElectronicInvoicing = async (enabled: boolean) => {
    if (!activeOrganizationId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ electronic_invoicing_enabled: enabled })
        .eq('id', activeOrganizationId);

      if (error) {
        toast.error('Error al actualizar configuración');
        console.error('Error updating organization:', error);
        return;
      }

      setIsEnabled(enabled);
      toast.success(
        enabled 
          ? 'Facturación electrónica habilitada' 
          : 'Facturación electrónica deshabilitada'
      );
    } catch (error) {
      toast.error('Error al actualizar configuración');
      console.error('Error updating organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAFIPConfiguration = async (config: Omit<AFIPConfiguration, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) => {
    if (!activeOrganizationId) return;

    setLoading(true);
    try {
      const configData = {
        ...config,
        organization_id: activeOrganizationId,
        created_by: activeOrganizationId // Usando organization id como fallback
      };

      let result;
      if (afipConfig) {
        result = await supabase
          .from('afip_configurations')
          .update(configData)
          .eq('id', afipConfig.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('afip_configurations')
          .insert(configData)
          .select()
          .single();
      }

      if (result.error) {
        toast.error('Error al guardar configuración AFIP');
        console.error('Error saving AFIP configuration:', result.error);
        return;
      }

      setAfipConfig(result.data);
      toast.success('Configuración AFIP guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar configuración AFIP');
      console.error('Error saving AFIP configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isEnabled,
    afipConfig,
    taxConditions,
    loading,
    targetOrganization,
    toggleElectronicInvoicing,
    saveAFIPConfiguration,
    loadAFIPConfiguration
  };
};
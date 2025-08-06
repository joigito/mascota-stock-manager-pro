import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';

export interface SystemConfiguration {
  id: string;
  organization_id: string;
  config_type: string;
  config_key: string;
  config_value: any;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface UnitSettings {
  available_units: string[];
}

export interface CategoryMargins {
  [category: string]: number;
}

export interface CategoryMinStock {
  [category: string]: number;
}

export const useSystemConfiguration = () => {
  const [configurations, setConfigurations] = useState<SystemConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();

  const loadConfigurations = async () => {
    if (!currentOrganization?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('config_type', { ascending: true });

      if (error) throw error;
      setConfigurations(data || []);
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (
    configType: string,
    configKey: string,
    configValue: any
  ) => {
    if (!currentOrganization?.id) return;

    try {
      const { error } = await supabase
        .from('system_configurations')
        .upsert({
          organization_id: currentOrganization.id,
          config_type: configType,
          config_key: configKey,
          config_value: configValue,
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (error) throw error;

      toast({
        title: "Configuración actualizada",
        description: "Los cambios se han guardado correctamente"
      });

      await loadConfigurations();
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
    }
  };

  const getConfiguration = (configType: string, configKey: string) => {
    return configurations.find(
      config => config.config_type === configType && config.config_key === configKey
    );
  };

  const getUnits = (): string[] => {
    const config = getConfiguration('unit_settings', 'available_units');
    return config?.config_value || ['unidades', 'kg', 'litros', 'metros'];
  };

  const getCategoryMargins = (): CategoryMargins => {
    const config = getConfiguration('margin_settings', 'category_margins');
    return config?.config_value || {};
  };

  const getCategoryMinStock = (): CategoryMinStock => {
    const config = getConfiguration('stock_settings', 'category_min_stock');
    return config?.config_value || {};
  };

  useEffect(() => {
    loadConfigurations();
  }, [currentOrganization?.id]);

  return {
    configurations,
    loading,
    updateConfiguration,
    getConfiguration,
    getUnits,
    getCategoryMargins,
    getCategoryMinStock,
    loadConfigurations
  };
};
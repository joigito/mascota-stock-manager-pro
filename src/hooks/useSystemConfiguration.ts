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

  // Available categories by industry type
  const AVAILABLE_CATEGORIES = [
    { key: 'forrajeria', label: 'Alimentos', description: 'Alimentos y productos alimenticios' },
    { key: 'mascotas', label: 'Mascotas', description: 'Accesorios y productos para mascotas' },
    { key: 'veterinarios', label: 'Veterinarios', description: 'Productos veterinarios' },
    { key: 'limpieza', label: 'Limpieza', description: 'Productos de limpieza' },
    { key: 'bebidas', label: 'Bebidas', description: 'Todo tipo de bebidas' },
    { key: 'informatica', label: 'Informática', description: 'Equipos y software informático' },
    { key: 'electronica', label: 'Electrónica', description: 'Dispositivos electrónicos' },
    { key: 'accesorios_tecnologia', label: 'Accesorios Tecnología', description: 'Accesorios para dispositivos' },
    { key: 'electrodomesticos', label: 'Electrodomésticos', description: 'Aparatos para el hogar' },
    { key: 'ferreteria', label: 'Ferretería', description: 'Herramientas y materiales' },
    { key: 'construccion', label: 'Construcción', description: 'Materiales de construcción' },
    { key: 'textil', label: 'Textil', description: 'Ropa y textiles' },
    { key: 'calzado', label: 'Calzado', description: 'Zapatos y calzado' },
    { key: 'juguetes', label: 'Juguetes', description: 'Juguetes para niños' },
    { key: 'deportes', label: 'Deportes', description: 'Artículos deportivos' },
    { key: 'jardineria', label: 'Jardinería', description: 'Plantas y herramientas de jardín' },
    { key: 'automotriz', label: 'Automotriz', description: 'Repuestos y accesorios de vehículos' },
    { key: 'otros', label: 'Otros', description: 'Otros productos diversos' }
  ];

  // Store types for quick filtering of relevant categories
  const STORE_TYPES = [
    { key: 'generico', label: 'General' },
    { key: 'deportes', label: 'Deportes' },
    { key: 'alimentos', label: 'Alimentos' },
    { key: 'mascotas', label: 'Mascotas' },
    { key: 'electronica', label: 'Electrónica' }
  ];

  // Recommended categories per store type
  const STORE_TYPE_CATEGORY_MAP: Record<string, string[]> = {
    generico: AVAILABLE_CATEGORIES.map(c => c.key),
    deportes: ['deportes', 'calzado', 'textil', 'otros'],
    alimentos: ['forrajeria', 'bebidas', 'limpieza', 'otros'],
    mascotas: ['mascotas', 'veterinarios', 'otros'],
    electronica: ['electronica', 'informatica', 'accesorios_tecnologia', 'electrodomesticos', 'otros']
  };

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
    if (!currentOrganization?.id) {
      console.error('useSystemConfiguration: No current organization');
      return;
    }

    console.log('useSystemConfiguration: Updating configuration:', {
      organization_id: currentOrganization.id,
      config_type: configType,
      config_key: configKey,
      config_value: configValue
    });

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

      if (error) {
        console.error('useSystemConfiguration: Database error:', error);
        throw error;
      }

      console.log('useSystemConfiguration: Configuration updated successfully');

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

  const getEnabledCategories = (): string[] => {
    const config = getConfiguration('category_settings', 'enabled_categories');
    return config?.config_value || ['forrajeria', 'mascotas', 'veterinarios', 'limpieza', 'bebidas'];
  };

  const getAvailableCategoriesForSelect = () => {
    const enabledKeys = getEnabledCategories();
    return AVAILABLE_CATEGORIES.filter(cat => enabledKeys.includes(cat.key));
  };

  const getStoreType = (): string => {
    const config = getConfiguration('store_settings', 'store_type');
    return config?.config_value || 'generico';
  };

  const getRecommendedCategoriesByStoreType = (type?: string): string[] => {
    const t = type || getStoreType();
    return STORE_TYPE_CATEGORY_MAP[t] || STORE_TYPE_CATEGORY_MAP['generico'];
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
    getEnabledCategories,
    getAvailableCategoriesForSelect,
    getStoreType,
    getRecommendedCategoriesByStoreType,
    AVAILABLE_CATEGORIES,
    STORE_TYPES,
    loadConfigurations
  };
};
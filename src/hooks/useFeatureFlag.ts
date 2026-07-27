import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { toast } from 'sonner';

interface FeatureFlagState {
  isEnabled: boolean;
  config: Record<string, any>;
  loading: boolean;
}

export const useFeatureFlag = (featureKey: string) => {
  const { currentOrganization } = useOrganization();
  const [state, setState] = useState<FeatureFlagState>({
    isEnabled: false,
    config: {},
    loading: true,
  });

  useEffect(() => {
    if (currentOrganization?.id) {
      loadFeature();
    } else {
      setState({ isEnabled: false, config: {}, loading: false });
    }
  }, [currentOrganization?.id, featureKey]);

  const loadFeature = async () => {
    if (!currentOrganization?.id) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const { data, error } = await supabase
        .from('organization_features')
        .select('enabled, config')
        .eq('organization_id', currentOrganization.id)
        .eq('feature_key', featureKey)
        .maybeSingle();

      if (error) {
        console.error(`Error loading feature ${featureKey}:`, error);
        setState({ isEnabled: false, config: {}, loading: false });
        return;
      }

      setState({
        isEnabled: data?.enabled || false,
        config: (data?.config as Record<string, any>) || {},
        loading: false,
      });
    } catch (error) {
      console.error(`Error loading feature ${featureKey}:`, error);
      setState({ isEnabled: false, config: {}, loading: false });
    }
  };

  const toggle = useCallback(async (enabled: boolean) => {
    if (!currentOrganization?.id) return;

    try {
      const { error } = await supabase
        .from('organization_features')
        .upsert(
          {
            organization_id: currentOrganization.id,
            feature_key: featureKey,
            enabled,
          },
          { onConflict: 'organization_id,feature_key' }
        );

      if (error) {
        toast.error('Error al actualizar feature');
        console.error(`Error toggling feature ${featureKey}:`, error);
        return;
      }

      setState((prev) => ({ ...prev, isEnabled: enabled }));
      toast.success(
        enabled ? 'Feature habilitada' : 'Feature deshabilitada'
      );
    } catch (error) {
      toast.error('Error al actualizar feature');
      console.error(`Error toggling feature ${featureKey}:`, error);
    }
  }, [currentOrganization?.id, featureKey]);

  const updateConfig = useCallback(async (newConfig: Record<string, any>) => {
    if (!currentOrganization?.id) return;

    try {
      const { error } = await supabase
        .from('organization_features')
        .upsert(
          {
            organization_id: currentOrganization.id,
            feature_key: featureKey,
            config: newConfig,
          },
          { onConflict: 'organization_id,feature_key' }
        );

      if (error) {
        toast.error('Error al guardar configuración');
        console.error(`Error updating config for ${featureKey}:`, error);
        return;
      }

      setState((prev) => ({ ...prev, config: newConfig }));
      toast.success('Configuración guardada');
    } catch (error) {
      toast.error('Error al guardar configuración');
      console.error(`Error updating config for ${featureKey}:`, error);
    }
  }, [currentOrganization?.id, featureKey]);

  return {
    isEnabled: state.isEnabled,
    config: state.config,
    loading: state.loading,
    toggle,
    updateConfig,
    reload: loadFeature,
  };
};

// Hook para cargar múltiples features de una vez
export const useFeatureFlags = (featureKeys: string[]) => {
  const { currentOrganization } = useOrganization();
  const [features, setFeatures] = useState<
    Record<string, { enabled: boolean; config: Record<string, any> }>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization?.id) {
      loadFeatures();
    } else {
      setFeatures({});
      setLoading(false);
    }
  }, [currentOrganization?.id, featureKeys.join(',')]);

  const loadFeatures = async () => {
    if (!currentOrganization?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('organization_features')
        .select('feature_key, enabled, config')
        .eq('organization_id', currentOrganization.id)
        .in('feature_key', featureKeys);

      if (error) {
        console.error('Error loading features:', error);
        return;
      }

      const featuresMap: Record<string, { enabled: boolean; config: Record<string, any> }> = {};

      // Initialize all requested keys as disabled
      featureKeys.forEach((key) => {
        featuresMap[key] = { enabled: false, config: {} };
      });

      // Override with actual values
      (data || []).forEach((row) => {
        featuresMap[row.feature_key] = {
          enabled: row.enabled,
          config: (row.config as Record<string, any>) || {},
        };
      });

      setFeatures(featuresMap);
    } catch (error) {
      console.error('Error loading features:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = (key: string) => features[key]?.enabled || false;
  const getConfig = (key: string) => features[key]?.config || {};

  return {
    features,
    loading,
    isEnabled,
    getConfig,
    reload: loadFeatures,
  };
};

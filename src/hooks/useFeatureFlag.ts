import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFeatureFlag = (featureKey: string, organizationId?: string) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizationId) {
      loadFeature();
    } else {
      setLoading(false);
    }
  }, [featureKey, organizationId]);

  const loadFeature = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_features')
        .select('enabled')
        .eq('organization_id', organizationId)
        .eq('feature_key', featureKey)
        .maybeSingle();

      if (error) {
        console.error(`Error loading feature ${featureKey}:`, error);
        setIsEnabled(false);
        return;
      }

      setIsEnabled(data?.enabled || false);
    } catch (error) {
      console.error(`Error loading feature ${featureKey}:`, error);
      setIsEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const toggle = useCallback(async (enabled: boolean) => {
    if (!organizationId) return;

    try {
      const { error } = await supabase
        .from('organization_features')
        .upsert(
          { organization_id: organizationId, feature_key: featureKey, enabled },
          { onConflict: 'organization_id,feature_key' }
        );

      if (error) throw error;

      setIsEnabled(enabled);
      toast(enabled ? 'Feature habilitada' : 'Feature deshabilitada');
    } catch (error) {
      console.error(`Error toggling feature ${featureKey}:`, error);
      toast.error('Error al actualizar feature');
    }
  }, [organizationId, featureKey]);

  return { isEnabled, loading, toggle };
};

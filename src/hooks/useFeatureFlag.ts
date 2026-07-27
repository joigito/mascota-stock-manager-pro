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
      // Check if row exists first
      const { data: existing } = await supabase
        .from('organization_features')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('feature_key', featureKey)
        .maybeSingle();

      if (existing) {
        // Update existing row
        const { error } = await supabase
          .from('organization_features')
          .update({ enabled })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new row
        const { error } = await supabase
          .from('organization_features')
          .insert({
            organization_id: organizationId,
            feature_key: featureKey,
            enabled,
          });

        if (error) throw error;
      }

      setIsEnabled(enabled);
      toast(enabled ? 'Feature habilitada' : 'Feature deshabilitada');
    } catch (error) {
      console.error(`Error toggling feature ${featureKey}:`, error);
      toast.error('Error al actualizar feature');
    }
  }, [organizationId, featureKey]);

  return { isEnabled, loading, toggle };
};

import { supabase } from '@/integrations/supabase/client';

const SLUG_REGEX = /^[a-z0-9]+$/;
const SLUG_MIN = 4;
const SLUG_MAX = 20;

export interface SlugValidation {
  valid: boolean;
  error?: string;
}

export const validateSlug = (slug: string): SlugValidation => {
  const trimmed = slug.trim().toLowerCase();

  if (trimmed.length < SLUG_MIN) {
    return { valid: false, error: `Mínimo ${SLUG_MIN} caracteres` };
  }
  if (trimmed.length > SLUG_MAX) {
    return { valid: false, error: `Máximo ${SLUG_MAX} caracteres` };
  }
  if (!SLUG_REGEX.test(trimmed)) {
    return { valid: false, error: 'Solo minúsculas, números y sin espacios' };
  }
  return { valid: true };
};

export const autoSlug = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, SLUG_MAX);
};

export const checkSlugAvailable = async (
  slug: string,
  excludeOrgId?: string
): Promise<{ available: boolean; error?: string }> => {
  try {
    let query = supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .limit(1);

    if (excludeOrgId) {
      query = query.neq('id', excludeOrgId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { available: (data?.length ?? 0) === 0 };
  } catch {
    return { available: false, error: 'No se pudo verificar el slug' };
  }
};

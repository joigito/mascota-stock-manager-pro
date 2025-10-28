import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock AuthContext and useOrganization
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('@/hooks/useOrganization', () => ({ useOrganization: () => ({ currentOrganization: { id: 'org-1' } }) }));

// Create a mock supabase client
const createBuilder = (response: any) => {
  const builder: any = {};
  const fn = () => builder;
  builder.select = fn;
  builder.eq = fn;
  builder.order = fn;
  builder.insert = fn;
  builder.update = fn;
  builder.delete = fn;
  builder.single = fn;
  builder.then = (resolve: any) => Promise.resolve(response).then(resolve);
  return builder;
};

vi.mock('@/integrations/supabase/client', () => {
  const defaultResp = { data: [], error: null };
  return {
    supabase: {
      from: (table: string) => createBuilder(defaultResp),
    }
  };
});

import { useProductVariants } from '@/hooks/useProductVariants';

const TestComponent = ({ productId }: { productId: string }) => {
  const { variants, attributes, loading } = useProductVariants(productId);
  return React.createElement('div', { 'data-testid': 'out' }, JSON.stringify({ variants, attributes, loading }));
};

describe('useProductVariants (mocked supabase)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('loadVariants should set empty variants when supabase returns empty arrays', async () => {
  render(React.createElement(TestComponent, { productId: 'prod-1' }));

    await waitFor(() => {
      const el = screen.getByTestId('out');
      expect(el.textContent).toContain('"variants":[]');
    });
  });
});

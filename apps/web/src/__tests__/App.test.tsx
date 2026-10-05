import { useQueryClient } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from '@/App';
import { queryClient } from '@/services/react-query';

const QueryClientProbe = () => {
  const providedClient = useQueryClient();
  return <p data-testid="query-client-probe">{String(providedClient === queryClient)}</p>;
};

vi.mock('@/router', async () => {
  const { createMemoryHistory, createRootRoute, createRouter } = await import('@tanstack/react-router');
  return {
    router: createRouter({
      history: createMemoryHistory(),
      routeTree: createRootRoute({ component: () => <QueryClientProbe /> })
    })
  };
});

describe('App', () => {
  afterEach(cleanup);

  it('should render the router inside the shared query client, so every route reads the same cache', async () => {
    render(<App />);
    expect((await screen.findByTestId('query-client-probe')).textContent).toBe('true');
  });
});

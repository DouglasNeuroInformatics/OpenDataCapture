import type { ComponentProps } from 'react';

import { QueryClient } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApplicationSettings } from '@/components/ApplicationSettings';
import { Route } from '@/routes/_app/admin/settings';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  ApplicationSettings: vi.fn((_: ComponentProps<typeof ApplicationSettings>) => null),
  navigate: vi.fn(),
  prefetchMail: vi.fn(() => Promise.resolve()),
  searchSchema: { parse: () => ({}) }
}));

vi.mock('@/components/ApplicationSettings', () => ({
  $ApplicationSettingsSearch: mocks.searchSchema,
  ApplicationSettings: mocks.ApplicationSettings,
  SETTINGS_TABS: [{ value: 'features' }, { prefetch: mocks.prefetchMail, value: 'mail' }]
}));

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options;
  if (typeof loader !== 'function') {
    throw new Error('Expected the route to define its loader as a function');
  }
  return loader({ context: { queryClient } } as Parameters<typeof loader>[0]);
};

const renderPage = (tab?: 'features' | 'interface' | 'mail') => {
  vi.spyOn(Route, 'useSearch').mockReturnValue({ tab });
  vi.spyOn(Route, 'useNavigate').mockReturnValue(mocks.navigate);
  const Component = Route.options.component!;
  return render(<Component />);
};

const reportTabChange = (tab: 'features' | 'interface' | 'mail') => {
  mocks.ApplicationSettings.mock.lastCall![0].onTabChange(tab);
};

describe('Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it('should prefetch what each tab reads in the loader, so no tab suspends when it is opened', async () => {
    const queryClient = new QueryClient();
    await runLoader(queryClient);
    expect(mocks.prefetchMail).toHaveBeenCalledWith(queryClient);
  });

  it('should read the chosen tab from the address through the settings search schema', () => {
    expect(Route.options.validateSearch).toBe(mocks.searchSchema);
  });

  it('should title the page as the application settings', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Application Settings' })).toBeTruthy();
  });

  it('should open the tab the address names', () => {
    renderPage('mail');
    expect(mocks.ApplicationSettings.mock.lastCall?.[0].tab).toBe('mail');
  });

  it('should put a chosen tab in the address, so a reload or a shared link reopens it', () => {
    renderPage();
    reportTabChange('interface');
    expect(mocks.navigate).toHaveBeenCalledWith({ search: { tab: 'interface' }, to: '.' });
  });
});

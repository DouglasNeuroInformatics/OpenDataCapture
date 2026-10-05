import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppErrorComponent } from '@/components/AppErrorComponent';
import { useAppStore } from '@/store';

import '@/services/i18n';

vi.mock('@/config', () => ({
  config: {
    dev: {},
    meta: { contactEmail: '', docsUrl: '', githubRepoUrl: '', licenseUrl: '' },
    setup: { apiBaseUrl: '', isGatewayEnabled: true }
  }
}));

const networkError = new AxiosError('Network Error', AxiosError.ERR_NETWORK);

const renderErrorComponent = (error: Error) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const resetQueries = vi.spyOn(queryClient, 'resetQueries');
  const reset = vi.fn();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <AppErrorComponent error={error} reset={reset} />
    </QueryClientProvider>
  );
  return { ...result, reset, resetQueries };
};

describe('AppErrorComponent', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    useAppStore.setState({ isOnline: true });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should show the terminal error page for a genuine application error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderErrorComponent(new Error('Cannot read properties of undefined'));
    expect(screen.getByTestId('error-page')).toBeTruthy();
  });

  it('should show a connection problem rather than the error page for a transient network failure', () => {
    renderErrorComponent(networkError);
    expect(screen.queryByTestId('error-page')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Connection Problem' })).toBeTruthy();
  });

  it('should describe an unreachable server when the browser is online', () => {
    renderErrorComponent(networkError);
    expect(screen.getByText(/We couldn't reach the server/)).toBeTruthy();
  });

  it('should promise automatic reconnection when the browser is offline', () => {
    useAppStore.setState({ isOnline: false });
    renderErrorComponent(networkError);
    expect(screen.getByText(/You appear to be offline/)).toBeTruthy();
  });

  it('should reset the failed queries and the error boundary when retried, so the page refetches its data', () => {
    const { reset, resetQueries } = renderErrorComponent(networkError);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(resetQueries).toHaveBeenCalledOnce();
    expect(reset).toHaveBeenCalledOnce();
  });

  it('should retry automatically when the browser comes back online', () => {
    const { reset } = renderErrorComponent(networkError);
    act(() => void window.dispatchEvent(new Event('online')));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('should stop listening for the browser coming online once unmounted', () => {
    const { reset, unmount } = renderErrorComponent(networkError);
    unmount();
    window.dispatchEvent(new Event('online'));
    expect(reset).not.toHaveBeenCalled();
  });
});

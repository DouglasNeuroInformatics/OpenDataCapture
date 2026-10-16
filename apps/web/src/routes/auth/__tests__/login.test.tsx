import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import type { BrandingConfig } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/auth/login';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  navigate: vi.fn(),
  post: vi.fn<
    (
      url: string,
      data: unknown,
      config: { validateStatus: (status: number) => boolean }
    ) => Promise<{ data: object; status: number }>
  >(),
  setupState: { activeLanguages: ['en'], branding: null as BrandingConfig | null, isDemo: false }
}));

vi.mock('axios', () => ({ default: { post: mocks.post } }));
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => mocks.navigate
}));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  setupStateQueryOptions: () => ({ queryKey: ['setup-state'] }),
  useSetupStateQuery: () => ({ data: mocks.setupState })
}));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: { login: typeof mocks.login }) => unknown) => selector({ login: mocks.login })
}));
vi.mock('@/components/DemoBanner', () => ({
  DemoBanner: ({ onLogin }: { onLogin: (credentials: $LoginCredentials) => void }) => (
    <button data-testid="demo-login" type="button" onClick={() => onLogin({ password: 'demo', username: 'david' })} />
  )
}));
vi.mock('@/components/LoginForm', () => ({
  LoginForm: ({ onSubmit }: { onSubmit: (credentials: $LoginCredentials) => void }) => (
    <button
      data-testid="login-submit"
      type="button"
      onClick={() => onSubmit({ password: 'secret', username: 'jane' })}
    />
  )
}));
vi.mock('@/components/LoginBranding', () => ({
  LoginBrandingPanel: () => <aside data-testid="login-branding-panel" />
}));

const renderPage = () => {
  const Component = Route.options.component!;
  return render(<Component />);
};

const respondWith = (status: number, data: object) => mocks.post.mockResolvedValue({ data, status });

const lastNotification = () => useNotificationsStore.getState().notifications.at(-1);

describe('login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotificationsStore.setState({ notifications: [] });
    mocks.setupState.branding = null;
    mocks.setupState.isDemo = false;
    respondWith(200, { accessToken: 'token-123' });
  });

  afterEach(cleanup);

  it('should prefetch the setup state before rendering', async () => {
    const ensureQueryData = vi.fn().mockResolvedValue(mocks.setupState);
    const loader = Route.options.loader as (opts: {
      context: { queryClient: { ensureQueryData: (options: unknown) => Promise<unknown> } };
    }) => Promise<unknown>;
    await loader({ context: { queryClient: { ensureQueryData } } });
    expect(ensureQueryData).toHaveBeenCalledWith({ queryKey: ['setup-state'] });
  });

  it('should post the submitted credentials to the login endpoint', async () => {
    renderPage();
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => expect(mocks.post).toHaveBeenCalled());
    expect(mocks.post.mock.lastCall?.slice(0, 2)).toEqual(['/v1/auth/login', { password: 'secret', username: 'jane' }]);
  });

  it('should accept only 200, 401 and 403 as answers, so any other status still throws', async () => {
    renderPage();
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => expect(mocks.post).toHaveBeenCalled());
    const validateStatus = mocks.post.mock.lastCall?.[2].validateStatus;
    expect([200, 401, 403, 404, 500].map((status) => validateStatus?.(status))).toEqual([
      true,
      true,
      true,
      false,
      false
    ]);
  });

  it('should store the access token and open the dashboard after a successful login', async () => {
    renderPage();
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: '/dashboard' }));
    expect(mocks.login).toHaveBeenCalledWith('token-123');
  });

  it('should explain that the credentials were rejected without logging in', async () => {
    respondWith(401, {});
    renderPage();
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => expect(lastNotification()).toBeDefined());
    expect(lastNotification()).toMatchObject({
      message: 'Invalid login credentials',
      title: 'Unauthorized',
      type: 'error'
    });
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('should tell an archived user to ask an administrator to restore their account', async () => {
    respondWith(403, { message: 'Account Archived' });
    renderPage();
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => expect(lastNotification()).toBeDefined());
    expect(lastNotification()).toMatchObject({ title: 'Account Archived', type: 'error' });
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('should tell a user refused for any other reason that their account is disabled', async () => {
    respondWith(403, { message: 'Forbidden' });
    renderPage();
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => expect(lastNotification()).toBeDefined());
    expect(lastNotification()).toMatchObject({ title: 'Account Disabled', type: 'error' });
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('should render the plain login card when branding is not configured', () => {
    renderPage();
    expect(screen.getByTestId('login-card')).toBeTruthy();
    expect(screen.queryByTestId('login-branding-panel')).toBeNull();
  });

  it('should render the plain login card when branding is configured but turned off', () => {
    mocks.setupState.branding = { enableBranding: false, instanceName: { en: 'Douglas' } };
    renderPage();
    expect(screen.queryByTestId('login-branding-panel')).toBeNull();
    expect(screen.queryByText('Douglas')).toBeNull();
  });

  it('should hide the demo banner on an instance that is not a demo', () => {
    renderPage();
    expect(screen.queryByTestId('demo-login')).toBeNull();
  });

  it('should log in with the credentials picked from the demo banner', async () => {
    mocks.setupState.isDemo = true;
    renderPage();
    fireEvent.click(screen.getByTestId('demo-login'));
    await waitFor(() => expect(mocks.login).toHaveBeenCalledWith('token-123'));
    expect(mocks.post.mock.lastCall?.[1]).toEqual({ password: 'demo', username: 'david' });
  });

  describe('when branding is enabled', () => {
    beforeEach(() => {
      mocks.setupState.branding = { enableBranding: true, instanceName: { en: 'Douglas Research Centre' } };
    });

    it('should show the branding panel beside the login card', () => {
      renderPage();
      expect(screen.getByTestId('login-branding-panel')).toBeTruthy();
      expect(screen.getByTestId('login-card')).toBeTruthy();
    });

    it('should name the instance above the login card', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: 'Douglas Research Centre' })).toBeTruthy();
    });

    it.each([
      ['no instance name is configured', undefined],
      ['the name has no entry for the reader language', { fr: 'Centre Douglas' }],
      ['the name is blank', { en: '   ' }]
    ])('should fall back to the product name when %s', (_, instanceName) => {
      mocks.setupState.branding = { enableBranding: true, instanceName };
      renderPage();
      expect(screen.getByRole('heading', { name: 'Open Data Capture' })).toBeTruthy();
    });

    it('should paint the form panel with the configured gradient', () => {
      mocks.setupState.branding = { enableBranding: true, rightPanelTheme: 'forest' };
      renderPage();
      const panel = screen.getByTestId('login-card').parentElement!;
      expect(panel.style.backgroundImage).toContain('#10b981');
    });

    it('should leave the form panel on the default background without a gradient theme', () => {
      renderPage();
      const panel = screen.getByTestId('login-card').parentElement!;
      expect(panel.getAttribute('style')).toBeNull();
    });

    it('should log in with the credentials picked from the demo banner', async () => {
      mocks.setupState.isDemo = true;
      renderPage();
      fireEvent.click(screen.getByTestId('demo-login'));
      await waitFor(() => expect(mocks.login).toHaveBeenCalledWith('token-123'));
    });

    it('should log in with the credentials submitted from the form', async () => {
      renderPage();
      expect(screen.queryByTestId('demo-login')).toBeNull();
      fireEvent.click(screen.getByTestId('login-submit'));
      await waitFor(() => expect(mocks.login).toHaveBeenCalledWith('token-123'));
    });
  });
});

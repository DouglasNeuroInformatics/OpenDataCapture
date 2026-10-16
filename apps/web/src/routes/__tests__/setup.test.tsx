import { QueryClient } from '@tanstack/react-query';
import { isRedirect } from '@tanstack/react-router';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/setup';

import '@/services/i18n';

const STRONG_PASSWORD = 'violet-harbor-quantum-lantern-58';

const mocks = vi.hoisted(() => ({
  invalidate: vi.fn(),
  mutation: {
    isPending: false,
    isSuccess: false,
    mutateAsync: vi.fn()
  },
  setupStateQueryOptions: vi.fn(() => ({ queryKey: ['setup-state'] }))
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Navigate: ({ to }: { to: string }) => <p data-testid="navigate">{to}</p>,
  useRouter: () => ({ invalidate: mocks.invalidate })
}));
vi.mock('@/hooks/useCreateSetupStateMutation', () => ({
  useCreateSetupStateMutation: () => mocks.mutation
}));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  setupStateQueryOptions: mocks.setupStateQueryOptions,
  useSetupStateQuery: () => ({ data: { activeLanguages: ['en', 'fr'] } })
}));

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options;
  if (typeof loader !== 'function') {
    throw new Error('Expected the route to define its loader as a function');
  }
  return loader({ context: { queryClient } } as Parameters<typeof loader>[0]);
};

const renderPage = () => {
  const Component = Route.options.component!;
  render(<Component />);
};

const form = () => screen.getByTestId('setup-form');

const field = (name: string) => form().querySelector<HTMLInputElement>(`[name="${name}"]`)!;

const type = (name: string, value: string) => fireEvent.change(field(name), { target: { value } });

const fillAdmin = ({ confirmPassword = STRONG_PASSWORD, password = STRONG_PASSWORD } = {}) => {
  type('firstName', 'Jane');
  type('lastName', 'Doe');
  type('username', 'admin');
  type('password', password);
  type('confirmPassword', confirmPassword);
};

const chooseInitDemo = (initDemo: boolean) => fireEvent.click(screen.getByLabelText(initDemo ? 'Yes' : 'No'));

const submit = () => fireEvent.click(screen.getByLabelText('Submit'));

const errorMessages = () => screen.queryAllByTestId('error-message-text').map((element) => element.textContent);

beforeEach(() => {
  mocks.mutation.isPending = false;
  mocks.mutation.isSuccess = false;
  mocks.mutation.mutateAsync.mockResolvedValue(undefined);
  mocks.invalidate.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('setup route', () => {
  it('should redirect to the dashboard from the loader once the instance is set up', async () => {
    const queryClient = new QueryClient();
    vi.spyOn(queryClient, 'fetchQuery').mockResolvedValue({ isSetup: true });
    const thrown: unknown = await runLoader(queryClient)?.catch((err: unknown) => err);
    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ options: { to: '/dashboard' } });
  });

  it('should let the loader through while the instance is not yet set up', async () => {
    const queryClient = new QueryClient();
    const fetchQuery = vi.spyOn(queryClient, 'fetchQuery').mockResolvedValue({ isSetup: false });
    await expect(runLoader(queryClient)).resolves.toBeUndefined();
    expect(fetchQuery).toHaveBeenCalledWith({ queryKey: ['setup-state'] });
  });

  it('should show a loading page while the instance is being initialized', () => {
    mocks.mutation.isPending = true;
    renderPage();
    expect(screen.getByText('Initializing Application')).toBeTruthy();
    expect(screen.queryByTestId('setup-form')).toBeNull();
  });

  it('should navigate to the dashboard once the instance is initialized', () => {
    mocks.mutation.isSuccess = true;
    renderPage();
    expect(screen.getByTestId('navigate').textContent).toBe('/dashboard');
  });

  it('should show the setup form before the instance is initialized', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Setup' })).toBeTruthy();
    expect(form()).toBeTruthy();
  });

  it('should rate the strength of the admin password as it is typed', () => {
    renderPage();
    type('password', STRONG_PASSWORD);
    expect(form().querySelector('.bg-green-500')).toBeTruthy();
  });

  it('should hide the demo data options until demo initialization is chosen', () => {
    renderPage();
    chooseInitDemo(false);
    expect(screen.queryByLabelText('Number of Dummy Subjects')).toBeNull();
    expect(screen.queryByLabelText('Records Per Subject')).toBeNull();
  });

  it('should offer the demo data options once demo initialization is chosen', async () => {
    renderPage();
    chooseInitDemo(true);
    expect(await screen.findByLabelText('Number of Dummy Subjects')).toBeTruthy();
    expect(screen.getByLabelText('Records Per Subject')).toBeTruthy();
  });

  it('should refuse a weak admin password', async () => {
    renderPage();
    fillAdmin({ confirmPassword: 'password', password: 'password' });
    chooseInitDemo(false);
    submit();
    await waitFor(() => expect(errorMessages()).toContain('Insufficient password strength'));
    expect(mocks.mutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('should refuse a confirmation that does not match the password', async () => {
    renderPage();
    fillAdmin({ confirmPassword: `${STRONG_PASSWORD}-typo` });
    chooseInitDemo(false);
    submit();
    await waitFor(() => expect(errorMessages()).toContain('Passwords Must Match'));
    expect(mocks.mutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('should create the setup state with the admin and demo options, leaving experimental features off', async () => {
    renderPage();
    fillAdmin();
    chooseInitDemo(true);
    type('dummySubjectCount', '10');
    type('recordsPerSubject', '5');
    submit();
    await waitFor(() => expect(mocks.mutation.mutateAsync).toHaveBeenCalled());
    expect(mocks.mutation.mutateAsync).toHaveBeenCalledWith({
      admin: { firstName: 'Jane', lastName: 'Doe', password: STRONG_PASSWORD, username: 'admin' },
      dummySubjectCount: 10,
      enableExperimentalFeatures: false,
      initDemo: true,
      recordsPerSubject: 5
    });
  });

  it('should invalidate the router after setup, so the loaders rerun against the new state', async () => {
    renderPage();
    fillAdmin();
    chooseInitDemo(false);
    submit();
    await waitFor(() => expect(mocks.invalidate).toHaveBeenCalledWith({}));
  });
});

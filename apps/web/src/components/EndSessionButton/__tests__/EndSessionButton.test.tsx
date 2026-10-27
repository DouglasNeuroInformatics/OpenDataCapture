import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { EndSessionButton } from '../EndSessionButton';

import '@/services/i18n';

const mocks = vi.hoisted(() => {
  const store: { currentSession: null | { id: string }; endSession: Mock } = {
    currentSession: null,
    endSession: vi.fn()
  };
  return { navigate: vi.fn(), store };
});

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mocks.navigate
}));

vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));

const endSessionButton = () => screen.getByTestId('nav-button-#');

const openConfirmation = (onEnded?: () => void) => {
  mocks.store.currentSession = { id: 'session-1' };
  render(<EndSessionButton onEnded={onEnded} />);
  fireEvent.click(endSessionButton());
};

describe('EndSessionButton', () => {
  beforeEach(() => {
    mocks.store.currentSession = null;
    mocks.store.endSession.mockReset();
    mocks.navigate.mockReset().mockResolvedValue(undefined);
  });

  afterEach(cleanup);

  it('should be disabled while no session is active', () => {
    render(<EndSessionButton />);
    expect(endSessionButton().hasAttribute('disabled')).toBe(true);
  });

  it('should ask for confirmation before ending the session', () => {
    openConfirmation();
    expect(screen.getByRole('dialog').textContent).toContain('End Session');
    expect(mocks.store.endSession).not.toHaveBeenCalled();
  });

  it('should end the session and go to the start page, bypassing any navigation blocker, once confirmed', () => {
    openConfirmation();
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(mocks.store.endSession).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith({ ignoreBlocker: true, to: '/session/start-session' });
  });

  it('should close the confirmation and report the end once the start page has been reached', async () => {
    const onEnded = vi.fn();
    openConfirmation(onEnded);
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onEnded).toHaveBeenCalledOnce();
  });

  it('should close the confirmation without ending the session when declined', async () => {
    const onEnded = vi.fn();
    openConfirmation(onEnded);
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(mocks.store.endSession).not.toHaveBeenCalled();
    expect(onEnded).not.toHaveBeenCalled();
  });
});

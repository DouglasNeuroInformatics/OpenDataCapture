import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ConnectivityBanner } from '@/components/ConnectivityBanner';
import { useAppStore } from '@/store';

import '@/services/i18n';

describe('ConnectivityBanner', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    useAppStore.setState({ isOnline: true, pendingRetries: 0 });
  });

  it('should render nothing on a healthy connection, so it never distracts from the app', () => {
    useAppStore.setState({ isOnline: true, pendingRetries: 0 });
    render(<ConnectivityBanner />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('should report reconnecting while requests are being retried online', () => {
    useAppStore.setState({ isOnline: true, pendingRetries: 2 });
    render(<ConnectivityBanner />);
    expect(screen.getByRole('status').textContent).toBe('Reconnecting…');
  });

  it('should report being offline when the browser has lost its connection', () => {
    useAppStore.setState({ isOnline: false, pendingRetries: 0 });
    render(<ConnectivityBanner />);
    expect(screen.getByRole('status').textContent).toBe('Offline — waiting for connection…');
  });

  it('should appear as soon as the connection drops, so a mid-session outage is reported without a reload', () => {
    render(<ConnectivityBanner />);
    expect(screen.queryByRole('status')).toBeNull();
    act(() => {
      useAppStore.setState({ isOnline: false });
    });
    expect(screen.getByRole('status').textContent).toBe('Offline — waiting for connection…');
  });
});

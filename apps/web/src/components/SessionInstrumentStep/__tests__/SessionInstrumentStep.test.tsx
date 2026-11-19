import type { InstrumentRendererProps } from '@opendatacapture/react-core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionInstrumentStep } from '../SessionInstrumentStep';

import '@/services/i18n';

const mocks = vi.hoisted(() => ({
  bundle: undefined as undefined | { bundle: string; id: string; kind: 'FORM' },
  InstrumentRenderer: vi.fn((_props: InstrumentRendererProps) => <div data-testid="instrument-renderer" />),
  useInstrumentBundle: vi.fn()
}));

vi.mock('@opendatacapture/react-core', () => ({ InstrumentRenderer: mocks.InstrumentRenderer }));
vi.mock('@/hooks/useInstrumentBundle', () => ({
  useInstrumentBundle: (id: string) => {
    mocks.useInstrumentBundle(id);
    return { data: mocks.bundle };
  }
}));
vi.mock('@/components/NavigationBlocker', () => ({ NavigationBlocker: () => null }));

describe('SessionInstrumentStep', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.bundle = undefined;
  });

  it('should load the bundle of the session instrument', () => {
    render(<SessionInstrumentStep instrumentId="form-1" onBack={vi.fn()} onSubmit={vi.fn()} />);
    expect(mocks.useInstrumentBundle).toHaveBeenCalledWith('form-1');
  });

  it('should wait for the bundle before rendering the instrument', () => {
    render(<SessionInstrumentStep instrumentId="form-1" onBack={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.queryByTestId('instrument-renderer')).toBeNull();
  });

  it('should render the instrument, submitting its answers to the page and blocking navigation away from them', () => {
    mocks.bundle = { bundle: '__BUNDLE__', id: 'form-1', kind: 'FORM' };
    const onSubmit = vi.fn();
    render(<SessionInstrumentStep instrumentId="form-1" onBack={vi.fn()} onSubmit={onSubmit} />);
    expect(mocks.InstrumentRenderer.mock.lastCall?.[0]).toMatchObject({
      NavigationBlocker: expect.any(Function),
      onSubmit,
      target: mocks.bundle
    });
  });

  it('should return to the session details when the clinician goes back', () => {
    const onBack = vi.fn();
    render(<SessionInstrumentStep instrumentId="form-1" onBack={onBack} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByTestId('session-instrument-back'));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

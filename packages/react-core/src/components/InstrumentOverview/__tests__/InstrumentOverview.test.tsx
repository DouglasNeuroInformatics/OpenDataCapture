import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { AnyUnilingualInstrument } from '@opendatacapture/runtime-core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { InstrumentOverview } from '../InstrumentOverview';

const baseInstrument = {
  details: { title: 'My Instrument' }
} as unknown as AnyUnilingualInstrument;

describe('InstrumentOverview', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render the title, and call onNext when Begin is clicked', () => {
    const onNext = vi.fn();
    render(<InstrumentOverview instrument={baseInstrument} onNext={onNext} />);
    expect(screen.getByText('My Instrument')).toBeTruthy();
    fireEvent.click(screen.getByText('Begin'));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('should show the estimated duration and instructions when the instrument declares them', () => {
    const instrument = {
      details: {
        estimatedDuration: 5,
        instructions: ['Step one', 'Step two'],
        title: 'My Instrument'
      }
    } as unknown as AnyUnilingualInstrument;
    render(<InstrumentOverview instrument={instrument} onNext={vi.fn()} />);
    expect(screen.getByText('Estimated Duration')).toBeTruthy();
    expect(screen.getByText('Instructions')).toBeTruthy();
    expect(screen.getByText('Step one, Step two')).toBeTruthy();
  });

  it('should omit the duration and instructions sections when the instrument declares neither', () => {
    render(<InstrumentOverview instrument={baseInstrument} onNext={vi.fn()} />);
    expect(screen.queryByText('Estimated Duration')).toBeNull();
    expect(screen.queryByText('Instructions')).toBeNull();
  });

  it('should prefer clientDetails over details when both are present', () => {
    const instrument = {
      clientDetails: { title: 'Client Title' },
      details: { title: 'Server Title' }
    } as unknown as AnyUnilingualInstrument;
    render(<InstrumentOverview instrument={instrument} onNext={vi.fn()} />);
    expect(screen.getByText('Client Title')).toBeTruthy();
  });

  it('should disable the Begin button when disableBegin is true', () => {
    render(<InstrumentOverview disableBegin instrument={baseInstrument} onNext={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Begin' }).hasAttribute('disabled')).toBe(true);
  });

  it('should render beforeBegin content when given', () => {
    render(
      <InstrumentOverview
        beforeBegin={<div data-testid="consent-gate" />}
        instrument={baseInstrument}
        onNext={vi.fn()}
      />
    );
    expect(screen.getByTestId('consent-gate')).toBeTruthy();
  });
});

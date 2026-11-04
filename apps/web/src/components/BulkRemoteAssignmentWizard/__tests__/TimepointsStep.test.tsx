import React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TimepointsStep } from '../TimepointsStep';

import type { DraftTimepoint } from '../types';

import '@/services/i18n';

const TODAY = '2026-01-15';
const DEFAULT_EXPIRY = '2026-02-14';

const instruments = [
  { id: 'instrument-1', title: 'Happiness Questionnaire' },
  { id: 'instrument-2', title: 'General Consent Form' }
];

const happinessTimepoint: DraftTimepoint = {
  expiresAt: DEFAULT_EXPIRY,
  instrumentId: 'instrument-1',
  instrumentTitle: 'Happiness Questionnaire'
};

const renderStep = (props: Partial<React.ComponentProps<typeof TimepointsStep>> = {}) => {
  const handlers = {
    onBack: vi.fn(),
    onChange: vi.fn(),
    onConfirm: vi.fn(),
    onRedirectUrlChange: vi.fn(),
    onStepChange: vi.fn()
  };
  const result = render(
    <TimepointsStep
      defaultExpiresAt={DEFAULT_EXPIRY}
      instruments={instruments}
      redirectUrl=""
      subjectCount={3}
      timepoints={[]}
      {...handlers}
      {...props}
    />
  );
  return { ...handlers, ...result };
};

const openInstrumentSelect = () => {
  fireEvent.keyDown(screen.getByTestId('bulk-instrument-select'), { key: 'Enter' });
};

const chooseInstrument = (title: string) => {
  openInstrumentSelect();
  fireEvent.click(screen.getByRole('option', { name: title }));
};

const expiryInput = () => screen.getByTestId<HTMLInputElement>('bulk-expiry-input');
const addButton = () => screen.getByTestId<HTMLButtonElement>('bulk-add-timepoint');
const reviewButton = () => screen.getByTestId<HTMLButtonElement>('bulk-confirm-timepoints');

describe('TimepointsStep', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(`${TODAY}T12:00:00`), toFake: ['Date'] });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should tell the user how many subjects each instrument is assigned to', () => {
    renderStep({ subjectCount: 7 });
    expect(
      screen.getByText('Each instrument is assigned to all 7 selected subjects, with its own expiry.')
    ).toBeTruthy();
  });

  it('should show an empty state and block review until an instrument is added', () => {
    renderStep();
    expect(screen.getByText('No instruments added yet.')).toBeTruthy();
    expect(reviewButton().disabled).toBe(true);
  });

  it('should prefill the expiry with the instance default and forbid choosing a past date', () => {
    renderStep();
    expect(expiryInput().value).toBe(DEFAULT_EXPIRY);
    expect(expiryInput().min).toBe(TODAY);
  });

  it('should disable adding until an instrument is chosen', () => {
    renderStep();
    expect(addButton().disabled).toBe(true);
  });

  it('should add the chosen instrument with the default expiry', () => {
    const { onChange } = renderStep();
    chooseInstrument('Happiness Questionnaire');
    fireEvent.click(addButton());
    expect(onChange).toHaveBeenCalledWith([happinessTimepoint]);
  });

  it('should append to the existing list, so earlier timepoints are kept', () => {
    const { onChange } = renderStep({ timepoints: [happinessTimepoint] });
    chooseInstrument('General Consent Form');
    fireEvent.click(addButton());
    expect(onChange).toHaveBeenCalledWith([
      happinessTimepoint,
      { expiresAt: DEFAULT_EXPIRY, instrumentId: 'instrument-2', instrumentTitle: 'General Consent Form' }
    ]);
  });

  it('should add the instrument with the expiry the user entered', () => {
    const { onChange } = renderStep();
    chooseInstrument('Happiness Questionnaire');
    fireEvent.change(expiryInput(), { target: { value: '2026-12-31' } });
    fireEvent.click(addButton());
    expect(onChange).toHaveBeenCalledWith([{ ...happinessTimepoint, expiresAt: '2026-12-31' }]);
  });

  it('should reset the instrument and expiry after adding, ready for the next timepoint', () => {
    renderStep();
    chooseInstrument('Happiness Questionnaire');
    fireEvent.change(expiryInput(), { target: { value: '2026-12-31' } });
    fireEvent.click(addButton());
    expect(expiryInput().value).toBe(DEFAULT_EXPIRY);
    expect(addButton().disabled).toBe(true);
  });

  it.each([
    ['today', TODAY],
    ['in the past', '2026-01-01'],
    ['cleared', '']
  ])('should disable adding when the expiry is %s, since the assignment would never be open', (_, value) => {
    renderStep();
    chooseInstrument('Happiness Questionnaire');
    fireEvent.change(expiryInput(), { target: { value } });
    expect(addButton().disabled).toBe(true);
  });

  it('should not offer an instrument already in the list, since the API refuses a duplicate assignment', () => {
    renderStep({ timepoints: [happinessTimepoint] });
    openInstrumentSelect();
    expect(screen.queryByRole('option', { name: 'Happiness Questionnaire' })).toBeNull();
    expect(screen.getByRole('option', { name: 'General Consent Form' })).toBeTruthy();
  });

  it('should add nothing when the chosen instrument is no longer available', () => {
    const { onChange, rerender } = renderStep();
    chooseInstrument('Happiness Questionnaire');
    rerender(
      <TimepointsStep
        defaultExpiresAt={DEFAULT_EXPIRY}
        instruments={[]}
        redirectUrl=""
        subjectCount={3}
        timepoints={[]}
        onBack={vi.fn()}
        onChange={onChange}
        onConfirm={vi.fn()}
        onRedirectUrlChange={vi.fn()}
        onStepChange={vi.fn()}
      />
    );
    fireEvent.click(addButton());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should remove only the timepoint whose remove button was clicked', () => {
    const consentTimepoint = { ...happinessTimepoint, instrumentId: 'instrument-2', instrumentTitle: 'Consent' };
    const { onChange } = renderStep({ timepoints: [happinessTimepoint, consentTimepoint] });
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove Instrument' })[0]!);
    expect(onChange).toHaveBeenCalledWith([consentTimepoint]);
  });

  it('should proceed to review once the list has a timepoint', () => {
    const { onConfirm } = renderStep({ timepoints: [happinessTimepoint] });
    fireEvent.click(reviewButton());
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should block review while loading, so the batch is not confirmed twice', () => {
    renderStep({ isLoading: true, timepoints: [happinessTimepoint] });
    expect(reviewButton().disabled).toBe(true);
  });

  it('should go back when the back button is clicked', () => {
    const { onBack } = renderStep();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('should let the user return to the subjects step through the breadcrumbs', () => {
    const { onStepChange } = renderStep();
    fireEvent.click(screen.getByTestId('bulk-breadcrumb-SUBJECTS'));
    expect(onStepChange).toHaveBeenCalledWith('SOURCE');
  });

  it('should report each edit of the redirect URL to the wizard, which holds it for the whole batch', () => {
    const { onRedirectUrlChange } = renderStep();
    fireEvent.change(screen.getByTestId('bulk-redirect-url-input'), { target: { value: 'https://example.com' } });
    expect(onRedirectUrlChange).toHaveBeenCalledWith('https://example.com');
  });

  it('should hold back review while the redirect URL is not https', () => {
    renderStep({ redirectUrl: 'http://example.com', timepoints: [happinessTimepoint] });
    expect(reviewButton().disabled).toBe(true);
  });

  it('should allow review with an https redirect URL', () => {
    renderStep({ redirectUrl: 'https://example.com', timepoints: [happinessTimepoint] });
    expect(reviewButton().disabled).toBe(false);
  });

  it('should explain what is wrong with the redirect URL once the user leaves the field, not while they type', () => {
    renderStep({ redirectUrl: 'http://example.com' });
    expect(screen.queryByTestId('bulk-redirect-url-error')).toBeNull();
    fireEvent.blur(screen.getByTestId('bulk-redirect-url-input'));
    expect(screen.getByTestId('bulk-redirect-url-error').textContent).toContain('https://');
  });

  it('should not call a blank redirect URL invalid, since the batch need not redirect', () => {
    renderStep();
    fireEvent.blur(screen.getByTestId('bulk-redirect-url-input'));
    expect(screen.queryByTestId('bulk-redirect-url-error')).toBeNull();
  });
});

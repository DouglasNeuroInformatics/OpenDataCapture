import React from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { BulkAssignmentFailure, BulkAssignmentIssue } from '@opendatacapture/schemas/assignment';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ReviewStep } from '../ReviewStep';

import type { DraftTimepoint } from '../types';

import '@/services/i18n';

const timepoints: DraftTimepoint[] = [
  { expiresAt: '2026-11-01', instrumentId: 'instrument-1', instrumentTitle: 'Happiness Questionnaire' },
  { expiresAt: '2026-12-01', instrumentId: 'instrument-2', instrumentTitle: 'General Consent Form' }
];

const refusal = (...issues: BulkAssignmentIssue[]): BulkAssignmentFailure => ({
  code: 'BULK_ASSIGNMENT_REFUSED',
  issues
});

const conflict: BulkAssignmentIssue = {
  conflicts: [
    { instrumentId: 'instrument-1', subjectId: 'subject-a' },
    { instrumentId: 'instrument-1', subjectId: 'subject-b' }
  ],
  kind: 'CONFLICT'
};

const renderReviewStep = (props: Partial<React.ComponentProps<typeof ReviewStep>> = {}) => {
  const callbacks = { onBack: vi.fn(), onStepChange: vi.fn(), onSubmit: vi.fn() };
  render(
    <ReviewStep
      describeSubject={(subjectId) => `described ${subjectId}`}
      failure={null}
      isSubmitting={false}
      subjectCount={3}
      timepoints={timepoints}
      transportError={false}
      {...callbacks}
      {...props}
    />
  );
  return callbacks;
};

const submitButton = () => screen.getByTestId<HTMLButtonElement>('bulk-submit');

const errorItems = () =>
  [...screen.getByTestId('bulk-error-list').querySelectorAll('li li')].map(({ textContent }) => textContent);

describe('ReviewStep', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should summarise the batch as subjects times instruments, so the user sees how many will be created', () => {
    renderReviewStep();
    expect(screen.getByTestId('bulk-review-summary').textContent).toBe('3 subjects × 2 instruments = 6 assignments');
  });

  it('should list every instrument in the batch beside its own expiry', () => {
    renderReviewStep();
    const rows = [...screen.getByTestId('bulk-review-step').querySelectorAll('tbody tr')];
    expect(rows.map((row) => [...row.querySelectorAll('td')].map(({ textContent }) => textContent))).toEqual([
      ['Happiness Questionnaire', '2026-11-01'],
      ['General Consent Form', '2026-12-01']
    ]);
  });

  it('should submit without allowing duplicates when the preflight passed', () => {
    const { onSubmit } = renderReviewStep();
    expect(screen.queryByTestId('bulk-error-list')).toBeNull();
    fireEvent.click(submitButton());
    expect(onSubmit).toHaveBeenCalledWith({ allowDuplicates: false });
  });

  it('should go back when the back button is pressed', () => {
    const { onBack } = renderReviewStep();
    fireEvent.click(screen.getByText('Back'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('should disable both actions while submitting, so a batch cannot be sent twice', () => {
    renderReviewStep({ isSubmitting: true });
    expect(submitButton().disabled).toBe(true);
    expect(screen.getByText<HTMLButtonElement>('Back').disabled).toBe(true);
  });

  it('should name conflicting subjects the way the user recognises them', () => {
    renderReviewStep({ failure: refusal(conflict) });
    expect(screen.getByTestId('bulk-error-list').textContent).toContain(
      '2 subject(s) already have an outstanding assignment'
    );
    expect(errorItems()).toEqual(['described subject-a', 'described subject-b']);
  });

  it('should block submission on a conflict until the user chooses to assign anyway', () => {
    renderReviewStep({ failure: refusal(conflict) });
    expect(submitButton().disabled).toBe(true);
    fireEvent.click(screen.getByTestId('bulk-allow-duplicates'));
    expect(submitButton().disabled).toBe(false);
  });

  it('should submit with duplicates allowed once the user has waived the conflict', () => {
    const { onSubmit } = renderReviewStep({ failure: refusal(conflict) });
    fireEvent.click(screen.getByTestId('bulk-allow-duplicates'));
    fireEvent.click(submitButton());
    expect(onSubmit).toHaveBeenCalledWith({ allowDuplicates: true });
  });

  it('should block submission again when the user unticks the waiver', () => {
    renderReviewStep({ failure: refusal(conflict) });
    fireEvent.click(screen.getByTestId('bulk-allow-duplicates'));
    fireEvent.click(screen.getByTestId('bulk-allow-duplicates'));
    expect(submitButton().disabled).toBe(true);
  });

  it('should list unavailable instruments by id and block submission, since no waiver can fix them', () => {
    renderReviewStep({
      failure: refusal({ instrumentIds: ['instrument-9'], kind: 'INSTRUMENT_UNAVAILABLE' })
    });
    expect(screen.getByTestId('bulk-error-list').textContent).toContain('This group cannot assign 1 of the');
    expect(errorItems()).toEqual(['instrument-9']);
    expect(screen.queryByTestId('bulk-allow-duplicates')).toBeNull();
    expect(submitButton().disabled).toBe(true);
  });

  it('should name unavailable subjects and block submission, since no waiver can fix them', () => {
    renderReviewStep({ failure: refusal({ kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['subject-c'] }) });
    expect(screen.getByTestId('bulk-error-list').textContent).toContain('1 subject(s) are not available');
    expect(errorItems()).toEqual(['described subject-c']);
    expect(submitButton().disabled).toBe(true);
  });

  it('should keep a waivable conflict blocked when it arrives alongside an unavailable subject', () => {
    renderReviewStep({ failure: refusal(conflict, { kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['subject-c'] }) });
    fireEvent.click(screen.getByTestId('bulk-allow-duplicates'));
    expect(submitButton().disabled).toBe(true);
  });

  it('should report a transport error while leaving the batch submittable, so the user can retry', () => {
    renderReviewStep({ transportError: true });
    expect(screen.getByTestId('bulk-error-list').textContent).toContain('The request could not be completed.');
    expect(submitButton().disabled).toBe(false);
  });

  it('should return to the subjects step from its breadcrumb', () => {
    const { onStepChange } = renderReviewStep();
    fireEvent.click(screen.getByTestId('bulk-breadcrumb-SUBJECTS'));
    expect(onStepChange).toHaveBeenCalledWith('SOURCE');
  });
});

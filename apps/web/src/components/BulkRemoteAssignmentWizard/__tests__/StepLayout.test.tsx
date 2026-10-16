import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StepLayout } from '@/components/BulkRemoteAssignmentWizard/StepLayout';

import '@/services/i18n';

const body = <div data-testid="step-body" />;

beforeEach(() => {
  // There are no vitest setup files in this repo, so RTL never auto-unmounts between tests.
  cleanup();
});

describe('StepLayout', () => {
  it('should mark the current step and let only a completed step be revisited', () => {
    const onStepChange = vi.fn();
    render(
      <StepLayout description="description" step="INSTRUMENTS" title="title" onStepChange={onStepChange}>
        {body}
      </StepLayout>
    );
    expect(screen.getByTestId('bulk-breadcrumb-INSTRUMENTS').getAttribute('aria-current')).toBe('step');
    expect(screen.getByTestId<HTMLButtonElement>('bulk-breadcrumb-REVIEW').disabled).toBe(true);
    fireEvent.click(screen.getByTestId('bulk-breadcrumb-SUBJECTS'));
    expect(onStepChange).toHaveBeenCalledWith('SOURCE');
  });

  it('should omit the progress band on the completion screen', () => {
    render(
      <StepLayout description="description" step={null} title="title">
        {body}
      </StepLayout>
    );
    expect(screen.queryByTestId('bulk-breadcrumbs')).toBeNull();
    expect(screen.getByTestId('step-body')).toBeTruthy();
  });

  it('should render the footer only when a step supplies actions', () => {
    const footer = <button data-testid="step-primary" type="button" />;
    const { rerender } = render(
      <StepLayout description="description" footer={footer} step="SUBJECTS" title="title">
        {body}
      </StepLayout>
    );
    expect(screen.getByTestId('step-primary')).toBeTruthy();
    rerender(
      <StepLayout description="description" step="SUBJECTS" title="title">
        {body}
      </StepLayout>
    );
    expect(screen.queryByTestId('step-primary')).toBeNull();
  });
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CustomFieldDraft } from '@/utils/subject-identification-draft';

import { CustomFieldEditor } from '../CustomFieldEditor';

import '@/services/i18n';

const field: CustomFieldDraft = { key: 'field', label: { en: 'Animal ID' }, pattern: '[A-Z]{2}[0-9]+' };

const renderEditor = (value: CustomFieldDraft = field, { showErrors = false } = {}) => {
  const onChange = vi.fn<(field: CustomFieldDraft) => void>();
  render(
    <CustomFieldEditor
      activeLanguages={['en', 'fr']}
      listControls={<button data-testid="list-controls" type="button" />}
      position={1}
      showErrors={showErrors}
      value={value}
      onChange={onChange}
    />
  );
  return onChange;
};

const type = (testId: string, value: string) => fireEvent.change(screen.getByTestId(testId), { target: { value } });

describe('CustomFieldEditor', () => {
  afterEach(cleanup);

  it('should name its inputs after its position, so a test can drive a field by where it is', () => {
    renderEditor();
    expect(screen.getByTestId<HTMLInputElement>('custom-field-1-label-en').value).toBe('Animal ID');
    expect(screen.getByTestId<HTMLInputElement>('custom-field-1-pattern').value).toBe('[A-Z]{2}[0-9]+');
  });

  it('should show the list controls it is given beside its heading', () => {
    renderEditor();
    expect(screen.getByTestId('list-controls')).toBeTruthy();
  });

  it('should report an edited label', () => {
    const onChange = renderEditor();
    type('custom-field-1-label-fr', "ID de l'animal");
    expect(onChange).toHaveBeenCalledWith({ ...field, label: { en: 'Animal ID', fr: "ID de l'animal" } });
  });

  it('should report edited help text', () => {
    const onChange = renderEditor();
    type('custom-field-1-help-en', 'On the cage card');
    expect(onChange).toHaveBeenCalledWith({ ...field, description: { en: 'On the cage card' } });
  });

  it('should report an edited pattern', () => {
    const onChange = renderEditor();
    type('custom-field-1-pattern', '[0-9]+');
    expect(onChange).toHaveBeenCalledWith({ ...field, pattern: '[0-9]+' });
  });

  it('should report an edited error message', () => {
    const onChange = renderEditor();
    type('custom-field-1-error-message-en', 'Two letters, then digits');
    expect(onChange).toHaveBeenCalledWith({ ...field, patternErrorMessage: { en: 'Two letters, then digits' } });
  });

  it('should say a pattern does not compile as soon as it is typed', () => {
    renderEditor({ ...field, pattern: '[A-Z' });
    expect(screen.getByTestId('custom-field-1-pattern-error')).toBeTruthy();
  });

  it('should leave a missing label and pattern unflagged until a save is refused', () => {
    renderEditor({ ...field, label: {}, pattern: '' });
    expect(screen.queryByTestId('custom-field-1-label-error')).toBeNull();
    expect(screen.queryByTestId('custom-field-1-pattern-error')).toBeNull();
  });

  it('should flag a missing label and pattern once a save is refused', () => {
    renderEditor({ ...field, label: {}, pattern: '' }, { showErrors: true });
    expect(screen.getByTestId('custom-field-1-label-error')).toBeTruthy();
    expect(screen.getByTestId('custom-field-1-pattern-error')).toBeTruthy();
  });

  it('should test a sample against the field pattern', () => {
    renderEditor();
    type('custom-field-1-test-input', 'ab-1234');
    expect(screen.getByTestId('custom-field-1-test-result').dataset.verdict).toBe('accepted');
  });

  it('should not test a sample against a pattern that does not compile', () => {
    renderEditor({ ...field, pattern: '[A-Z' });
    type('custom-field-1-test-input', 'ab-1234');
    expect(screen.getByTestId('custom-field-1-test-result').dataset.verdict).toBe('no-pattern');
  });
});

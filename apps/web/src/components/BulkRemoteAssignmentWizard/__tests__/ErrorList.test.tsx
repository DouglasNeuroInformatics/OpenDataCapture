import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ErrorList } from '../ErrorList';

import '@/services/i18n';

describe('ErrorList', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render nothing when there are no errors, so a clean step shows no alert', () => {
    render(<ErrorList errors={[]} />);
    expect(screen.queryByTestId('bulk-error-list')).toBeNull();
  });

  it('should announce the errors as an alert stating that nothing was created', () => {
    render(<ErrorList errors={[{ message: 'Missing subject ID' }]} />);
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Nothing has been created');
    expect(alert.textContent).toContain('Missing subject ID');
  });

  it('should prefix a row-specific error with its row number, so the user can find it in their file', () => {
    render(<ErrorList errors={[{ message: 'Missing subject ID', row: 3 }]} />);
    expect(screen.getByRole('alert').querySelector('li')!.textContent).toBe('Row 3: Missing subject ID');
  });

  it('should omit the row prefix from an error that applies to the whole file', () => {
    render(<ErrorList errors={[{ message: 'The workbook contains no sheets.' }]} />);
    expect(screen.getByRole('alert').querySelector('li')!.textContent).toBe('The workbook contains no sheets.');
  });

  it('should list the detail items beneath their message, so a refusal names every affected subject', () => {
    render(<ErrorList errors={[{ items: ['alice', 'bob'], message: '2 subject(s) are unavailable:' }]} />);
    const nested = screen.getByRole('alert').querySelector<HTMLElement>('li ul')!;
    expect(
      within(nested)
        .getAllByRole('listitem')
        .map(({ textContent }) => textContent)
    ).toEqual(['alice', 'bob']);
  });

  it('should render no nested list for an empty set of detail items', () => {
    render(<ErrorList errors={[{ items: [], message: 'Nothing to name' }]} />);
    expect(screen.getByRole('alert').querySelector('li ul')).toBeNull();
  });
});

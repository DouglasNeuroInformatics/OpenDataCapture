import React from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { BulkParseResult } from '@/utils/bulk-assignments';

import { MapStep } from '../MapStep';

import '@/services/i18n';

const idRows = [
  { first_name: 'Alice', subject_id: '001' },
  { first_name: 'Bob', subject_id: '002' }
];

const byId: BulkParseResult = {
  headers: ['subject_id', 'first_name'],
  mapping: { subject_id: 'subjectId' },
  mode: 'ID',
  preview: idRows,
  rows: idRows
};

const piiRows = [{ dob: '1979-08-12', first: 'Alice', last: 'Martin', sex: 'F' }];

const byPersonalInformation: BulkParseResult = {
  headers: ['first', 'last', 'dob', 'sex'],
  mapping: { dob: 'dateOfBirth', first: 'firstName', last: 'lastName', sex: 'sex' },
  mode: 'PII',
  preview: piiRows,
  rows: piiRows
};

const unmapped: BulkParseResult = { ...byId, mapping: {} };

const renderMapStep = (parsed: BulkParseResult) => {
  const callbacks = { onBack: vi.fn(), onResolved: vi.fn(), onStepChange: vi.fn() };
  render(<MapStep groupName="Depression Clinic" parsed={parsed} {...callbacks} />);
  return callbacks;
};

const continueButton = () => screen.getByTestId<HTMLButtonElement>('bulk-confirm-mapping');

const openFieldSelect = (header: string) => {
  fireEvent.keyDown(screen.getByTestId(`bulk-map-select-${header}`), { key: 'Enter' });
};

const chooseField = async (header: string, label: string) => {
  openFieldSelect(header);
  fireEvent.click(await screen.findByRole('option', { name: label }));
};

/** `run` fires its promise with `void`, so an error it rethrows surfaces only as an unhandled rejection. */
const captureUnhandledRejection = async (act: () => void) => {
  const listeners = process.listeners('unhandledRejection');
  process.removeAllListeners('unhandledRejection');
  try {
    const rejection = new Promise<unknown>((resolve) => process.once('unhandledRejection', resolve));
    act();
    return await rejection;
  } finally {
    process.removeAllListeners('unhandledRejection');
    listeners.forEach((listener) => process.on('unhandledRejection', listener));
  }
};

describe('MapStep', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should report how many rows were found, so the user can check the whole file was read', () => {
    renderMapStep(byId);
    expect(screen.getByText('Check that the columns were read correctly. 2 rows found.')).toBeTruthy();
  });

  it('should preview every cell of the parsed rows under its header', () => {
    renderMapStep(byId);
    const cells = [...screen.getByTestId('bulk-preview-table').querySelectorAll('tbody td')];
    expect(cells.map(({ textContent }) => textContent)).toEqual(['001', 'Alice', '002', 'Bob']);
  });

  it('should badge a file with a subject ID column as identified by ID', () => {
    renderMapStep(byId);
    expect(screen.getByTestId('bulk-detected-mode').textContent).toBe('Subject ID');
  });

  it('should badge a file with complete personal information as such, and say it never leaves the browser', () => {
    renderMapStep(byPersonalInformation);
    expect(screen.getByTestId('bulk-detected-mode').textContent).toBe('Personal Information');
    expect(screen.getByText(/The personal information in this file is never sent\./)).toBeTruthy();
  });

  it('should disable continuing and show no badge until an identifying column is mapped', () => {
    renderMapStep(unmapped);
    expect(screen.queryByTestId('bulk-detected-mode')).toBeNull();
    expect(continueButton().disabled).toBe(true);
  });

  it('should show an unmapped column as not used', () => {
    renderMapStep(byId);
    const trigger = screen.getByTestId('bulk-map-select-first_name');
    expect(trigger.textContent).toBe('Not Used');
    expect(trigger.classList.contains('italic')).toBe(true);
  });

  it('should not offer a field another column has already claimed, so no field is mapped twice', async () => {
    renderMapStep(byId);
    openFieldSelect('first_name');
    const options = await screen.findAllByRole('option');
    expect(options.map(({ textContent }) => textContent)).toEqual([
      'Not Used',
      'First Name',
      'Last Name',
      'Date of Birth',
      'Sex at Birth'
    ]);
  });

  it('should still offer a column the field it currently holds', async () => {
    renderMapStep(byId);
    openFieldSelect('subject_id');
    expect(await screen.findByRole('option', { name: 'Subject ID' })).toBeTruthy();
  });

  it('should enable continuing once the user maps a subject ID column by hand', async () => {
    renderMapStep(unmapped);
    await chooseField('subject_id', 'Subject ID');
    expect(screen.getByTestId('bulk-map-select-subject_id').textContent).toBe('Subject ID');
    expect(continueButton().disabled).toBe(false);
  });

  it('should disable continuing when the user unmaps the only identifying column', async () => {
    renderMapStep(byId);
    await chooseField('subject_id', 'Not Used');
    expect(screen.getByTestId('bulk-map-select-subject_id').textContent).toBe('Not Used');
    expect(continueButton().disabled).toBe(true);
  });

  it('should resolve custom identifiers into their group-scoped form, since that is how they are stored', async () => {
    const { onResolved } = renderMapStep(byId);
    fireEvent.click(continueButton());
    await waitFor(() => expect(onResolved).toHaveBeenCalledWith(['Depression_Clinic$001', 'Depression_Clinic$002']));
  });

  it('should resolve with the mapping the user chose rather than the one detected on parse', async () => {
    const { onResolved } = renderMapStep({ ...byId, mapping: { first_name: 'subjectId' } });
    await chooseField('first_name', 'Not Used');
    await chooseField('subject_id', 'Subject ID');
    fireEvent.click(continueButton());
    await waitFor(() => expect(onResolved).toHaveBeenCalledWith(['Depression_Clinic$001', 'Depression_Clinic$002']));
  });

  it('should derive a subject hash from personal information in the browser', async () => {
    const { onResolved } = renderMapStep(byPersonalInformation);
    fireEvent.click(continueButton());
    await waitFor(() => expect(onResolved).toHaveBeenCalledWith([expect.stringMatching(/^[0-9a-f]{64}$/)]));
  });

  it('should list the rows that could not be resolved instead of continuing', async () => {
    const { onResolved } = renderMapStep({ ...byId, rows: [{ first_name: 'Alice', subject_id: '' }] });
    fireEvent.click(continueButton());
    expect((await screen.findByTestId('bulk-error-list')).textContent).toContain('Row 2: Missing subject ID');
    expect(onResolved).not.toHaveBeenCalled();
  });

  it('should rethrow an unexpected error rather than show it as a mapping problem, so it is never swallowed', async () => {
    const { onResolved } = renderMapStep(byId);
    const unexpected = new Error('unexpected');
    onResolved.mockImplementation(() => {
      throw unexpected;
    });
    await expect(captureUnhandledRejection(() => fireEvent.click(continueButton()))).resolves.toBe(unexpected);
    expect(screen.queryByTestId('bulk-error-list')).toBeNull();
  });

  it('should go back when the back button is pressed', () => {
    const { onBack } = renderMapStep(byId);
    fireEvent.click(screen.getByText('Back'));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

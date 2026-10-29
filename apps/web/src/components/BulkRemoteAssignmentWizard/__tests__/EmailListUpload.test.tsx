import React from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { assertFileSize, parseEmailListWorkbook } from '@/utils/bulk-assignments';

import { EmailListUpload } from '../EmailListUpload';
import { captureUnhandledRejection } from './capture-unhandled-rejection';

import '@/services/i18n';

vi.mock('@/utils/bulk-assignments', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/bulk-assignments')>()),
  assertFileSize: vi.fn(),
  parseEmailListWorkbook: vi.fn()
}));

const knownSubjectIds = ['GroupA$alice123', 'GroupA$bob456'];

const renderUpload = (overrides: Partial<React.ComponentProps<typeof EmailListUpload>> = {}) => {
  const onEmailsMerged = vi.fn();
  const props: React.ComponentProps<typeof EmailListUpload> = {
    emails: {},
    groupName: 'GroupA',
    knownSubjectIds,
    onEmailsMerged,
    selectedIds: knownSubjectIds,
    ...overrides
  };
  const { rerender } = render(<EmailListUpload {...props} />);
  return {
    onEmailsMerged,
    rerenderWith: (next: Partial<React.ComponentProps<typeof EmailListUpload>>) =>
      rerender(<EmailListUpload {...props} {...next} />)
  };
};

const expand = () => fireEvent.click(screen.getByTestId('email-list-upload-toggle'));

const dropFile = (content: string, name = 'emails.csv', type = 'text/csv') => {
  const file = new File([content], name, { type });
  const input = screen.getByTestId('email-list-upload').querySelector('input[type="file"]')!;
  fireEvent.change(input, { target: { files: [file] } });
};

describe('EmailListUpload', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should start collapsed', () => {
    renderUpload();
    expect(screen.getByTestId('email-list-upload')).toBeTruthy();
    expect(screen.getByTestId('email-list-upload').querySelector('input[type="file"]')).toBeNull();
  });

  it('should show the file dropzone when expanded', () => {
    renderUpload();
    expand();
    expect(screen.getByTestId('email-list-upload').querySelector('input[type="file"]')).toBeTruthy();
  });

  it('should number the download and upload instructions, so their order is unambiguous', () => {
    renderUpload();
    expand();
    expect(screen.getByTestId('email-list-step-1').textContent).toBe('1');
    expect(screen.getByTestId('email-list-step-2').textContent).toBe('2');
  });

  it('should parse a dropped CSV file and show a column mapper', async () => {
    renderUpload();
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-mapping')).toBeTruthy());
    expect(screen.getByTestId('email-list-map-subject_id')).toBeTruthy();
    expect(screen.getByTestId('email-list-map-email')).toBeTruthy();
  });

  it('should auto-detect subject ID and email columns', async () => {
    renderUpload();
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-mapping')).toBeTruthy());
    expect(screen.getByTestId('email-list-map-subject_id').textContent).toBe('Subject ID');
    expect(screen.getByTestId('email-list-map-email').textContent).toBe('Email');
  });

  it('should merge matched emails when the apply button is clicked', async () => {
    const { onEmailsMerged } = renderUpload();
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com\nbob456,bob@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(onEmailsMerged).toHaveBeenCalledWith({
      GroupA$alice123: 'alice@example.com',
      GroupA$bob456: 'bob@example.com'
    });
  });

  it('should show an error when no subjects match', async () => {
    renderUpload();
    expand();
    dropFile('subject_id,email\nunknown,nobody@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.getByTestId('email-list-errors')).toBeTruthy();
  });

  it('should show a matched count after applying and collapse the mapper', async () => {
    const { onEmailsMerged } = renderUpload();
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(onEmailsMerged).toHaveBeenCalled();
    expect(screen.getByTestId('email-list-matched').textContent).toBe('1 emails matched to selected subjects');
    expect(screen.queryByTestId('email-list-unmatched')).toBeNull();
  });

  it('should warn how many selected subjects still have no address, counting the wizard own emails', async () => {
    renderUpload({ emails: { GroupA$alice123: 'alice@example.com' } });
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.getByTestId('email-list-missing').textContent).toBe(
      'Warning: 1 selected subject does not have an email address in the uploaded file.'
    );
  });

  it('should raise no warning once every selected subject has an address', async () => {
    renderUpload({
      emails: { GroupA$alice123: 'alice@example.com', GroupA$bob456: 'bob@example.com' }
    });
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.queryByTestId('email-list-missing')).toBeNull();
  });

  it('should report how many subject IDs matched nothing, so a typo is not mistaken for a sent email', async () => {
    renderUpload();
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com\nnobody,ghost@example.com\nnoone,other@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.getByTestId('email-list-matched').textContent).toBe('1 emails matched to selected subjects');
    expect(screen.getByTestId('email-list-unmatched').textContent).toBe(
      '2 subjects in the file do not exist in this group'
    );
  });

  // With nothing selected, matching still runs against the whole group, so the line must not claim
  // a selection that does not exist.
  it('should not credit the match to a selection when no subject is selected', async () => {
    renderUpload({ selectedIds: [] });
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.getByTestId('email-list-matched').textContent).toBe('1 emails matched to subjects in this group');
    expect(screen.queryByTestId('email-list-missing')).toBeNull();
  });

  it('should report a subject found in the file but left without an address', async () => {
    renderUpload({ selectedIds: ['GroupA$alice123'] });
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com\nbob456,\nnobody,ghost@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.getByTestId('email-list-no-email').textContent).toBe(
      'Warning: 1 subject was found in the file but is missing an email address.'
    );
    expect(screen.getByTestId('email-list-unmatched').textContent).toBe(
      '1 subjects in the file do not exist in this group'
    );
  });

  it('should pluralize both warnings when they count more than one subject', async () => {
    renderUpload({
      knownSubjectIds: ['GroupA$alice123', 'GroupA$bob456', 'GroupA$carol789', 'GroupA$dave012', 'GroupA$erin345'],
      selectedIds: ['GroupA$bob456', 'GroupA$carol789']
    });
    expand();
    dropFile('subject_id,email\nerin345,erin@example.com\nalice123,\ndave012,');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.getByTestId('email-list-missing').textContent).toBe(
      'Warning: 2 selected subjects do not have an email address in the uploaded file.'
    );
    expect(screen.getByTestId('email-list-no-email').textContent).toBe(
      'Warning: 2 subjects were found in the file but are missing an email address.'
    );
  });

  // Both warnings would otherwise say the same thing about the same subject.
  it('should leave a selected subject out of the file warning, since the selection warning names it', async () => {
    renderUpload({ emails: { GroupA$alice123: 'alice@example.com' } });
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com\nbob456,');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.getByTestId('email-list-missing').textContent).toBe(
      'Warning: 1 selected subject does not have an email address in the uploaded file.'
    );
    expect(screen.queryByTestId('email-list-no-email')).toBeNull();
  });

  it('should name the subjects behind a warning when its line is opened', async () => {
    renderUpload({ selectedIds: ['GroupA$alice123'] });
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com\nbob456,\nnobody,ghost@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.queryByTestId('email-list-no-email-subjects')).toBeNull();
    fireEvent.click(screen.getByTestId('email-list-no-email'));
    expect(screen.getByTestId('email-list-no-email-subjects').textContent).toBe('bob456');
  });

  // These match no subject, so there is no stored identifier to unscope: the file's own spelling is
  // the only thing that tells the user which row to fix.
  it('should name a missing subject as the file spelled it', async () => {
    renderUpload();
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com\nnobody,ghost@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    fireEvent.click(screen.getByTestId('email-list-unmatched'));
    expect(screen.getByTestId('email-list-unmatched-subjects').textContent).toBe('nobody');
  });

  it('should hide the subjects again when the line is closed', async () => {
    renderUpload({ selectedIds: ['GroupA$alice123'] });
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com\nbob456,');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    fireEvent.click(screen.getByTestId('email-list-no-email'));
    expect(screen.getByTestId('email-list-no-email-subjects')).toBeTruthy();
    fireEvent.click(screen.getByTestId('email-list-no-email'));
    expect(screen.queryByTestId('email-list-no-email-subjects')).toBeNull();
  });

  it('should unscope the identifiers of the selected subjects a warning names', async () => {
    renderUpload({ emails: { GroupA$alice123: 'alice@example.com' } });
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    fireEvent.click(screen.getByTestId('email-list-missing'));
    expect(screen.getByTestId('email-list-missing-subjects').textContent).toBe('bob456');
  });

  // The file is parsed once; which of its addresses matter depends on who is selected at the time.
  it('should re-report the applied file when the selection changes', async () => {
    const { rerenderWith } = renderUpload();
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.getByTestId('email-list-matched').textContent).toBe('1 emails matched to selected subjects');
    rerenderWith({ selectedIds: ['GroupA$bob456'] });
    expect(screen.getByTestId('email-list-matched').textContent).toBe('0 emails matched to selected subjects');
    rerenderWith({ selectedIds: [] });
    expect(screen.getByTestId('email-list-matched').textContent).toBe('1 emails matched to subjects in this group');
  });

  it('should drop the selection warning as the subjects it named are unselected', async () => {
    const { rerenderWith } = renderUpload({ emails: { GroupA$alice123: 'alice@example.com' } });
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(screen.getByTestId('email-list-missing').textContent).toBe(
      'Warning: 1 selected subject does not have an email address in the uploaded file.'
    );
    rerenderWith({ emails: { GroupA$alice123: 'alice@example.com' }, selectedIds: ['GroupA$alice123'] });
    expect(screen.queryByTestId('email-list-missing')).toBeNull();
  });

  it('should cancel and return to the file dropzone', async () => {
    renderUpload();
    expand();
    dropFile('subject_id,email\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-cancel')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-cancel'));
    expect(screen.queryByTestId('email-list-mapping')).toBeNull();
    expect(screen.getByTestId('email-list-upload').querySelector('input[type="file"]')).toBeTruthy();
  });

  it('should show a parse error when the data is malformed', async () => {
    renderUpload();
    expand();
    dropFile('subject_id\n"001');
    await waitFor(() => expect(screen.getByTestId('email-list-errors')).toBeTruthy());
  });

  it('should disable apply until both subject ID and email columns are mapped', async () => {
    renderUpload();
    expand();
    dropFile('subject_id,address\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-apply')).toBeTruthy());
    expect(screen.getByTestId<HTMLButtonElement>('email-list-apply').disabled).toBe(true);
  });

  it('should allow remapping a column via the select dropdown', async () => {
    renderUpload();
    expand();
    dropFile('id,mail\nalice123,alice@example.com');
    await waitFor(() => expect(screen.getByTestId('email-list-mapping')).toBeTruthy());
    fireEvent.keyDown(screen.getByTestId('email-list-map-mail'), { key: 'Enter' });
    fireEvent.click(await screen.findByRole('option', { name: 'Not Used' }));
    expect(screen.getByTestId<HTMLButtonElement>('email-list-apply').disabled).toBe(true);
    fireEvent.keyDown(screen.getByTestId('email-list-map-mail'), { key: 'Enter' });
    fireEvent.click(await screen.findByRole('option', { name: 'Email' }));
    expect(screen.getByTestId<HTMLButtonElement>('email-list-apply').disabled).toBe(false);
  });

  it('should download a CSV template with the selected subject IDs and an empty email column', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:template');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
    const clicked: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this);
    });
    renderUpload({ selectedIds: ['GroupA$alice123', 'GroupA$bob456'] });
    expand();
    fireEvent.click(screen.getByTestId('email-list-download-template'));
    expect(clicked).toHaveLength(1);
    expect(clicked[0]!.download).toBe('email-list-template.csv');
    const blob = createObjectURL.mock.lastCall![0] as Blob;
    expect(await blob.text()).toBe('subject_id,email\r\nalice123,\r\nbob456,');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:template');
  });

  it('should show the count of selected subjects on the download button', () => {
    renderUpload({ selectedIds: ['GroupA$alice123'] });
    expand();
    expect(screen.getByTestId('email-list-download-template').textContent).toContain('(1)');
  });

  it('should show zero in the count when no subjects are selected', () => {
    renderUpload({ selectedIds: [] });
    expand();
    expect(screen.getByTestId('email-list-empty-warning')).toBeTruthy();
    expect(screen.getByTestId('email-list-download-template').textContent).toContain('(0)');
  });

  it('should not show the empty warning when subjects are selected', () => {
    renderUpload({ selectedIds: knownSubjectIds });
    expand();
    expect(screen.queryByTestId('email-list-empty-warning')).toBeNull();
  });

  it('should parse an xlsx file as a workbook', async () => {
    vi.mocked(parseEmailListWorkbook).mockResolvedValue({
      headers: ['subject_id', 'email'],
      mapping: { email: 'email', subject_id: 'subjectId' },
      rows: [{ email: 'alice@example.com', subject_id: 'alice123' }]
    });
    const { onEmailsMerged } = renderUpload();
    expand();
    const file = new File(['workbook'], 'emails.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const input = screen.getByTestId('email-list-upload').querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(screen.getByTestId('email-list-mapping')).toBeTruthy());
    fireEvent.click(screen.getByTestId('email-list-apply'));
    expect(onEmailsMerged).toHaveBeenCalledWith({ GroupA$alice123: 'alice@example.com' });
    expect(parseEmailListWorkbook).toHaveBeenCalledWith(file);
  });

  it('should ignore columns that map to fields other than subject ID or email', async () => {
    renderUpload();
    expand();
    dropFile('subject_id,email,date_of_birth\nalice123,alice@example.com,1990-01-01');
    await waitFor(() => expect(screen.getByTestId('email-list-mapping')).toBeTruthy());
    expect(screen.getByTestId('email-list-map-subject_id').textContent).toBe('Subject ID');
    expect(screen.getByTestId('email-list-map-email').textContent).toBe('Email');
    expect(screen.getByTestId('email-list-map-date_of_birth').textContent).toBe('Not Used');
  });

  it('should rethrow an unexpected error rather than show it as a parse problem', async () => {
    const unexpected = new Error('unexpected');
    vi.mocked(assertFileSize).mockImplementation(() => {
      throw unexpected;
    });
    renderUpload();
    expand();
    const file = new File(['data'], 'emails.csv', { type: 'text/csv' });
    const input = screen.getByTestId('email-list-upload').querySelector('input[type="file"]')!;
    await expect(captureUnhandledRejection(() => fireEvent.change(input, { target: { files: [file] } }))).resolves.toBe(
      unexpected
    );
    expect(screen.queryByTestId('email-list-errors')).toBeNull();
  });
});

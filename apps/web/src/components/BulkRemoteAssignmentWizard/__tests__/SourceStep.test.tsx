import React from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { Subject } from '@opendatacapture/schemas/subject';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BulkParseFailure, parseWorkbook } from '@/utils/bulk-assignments';
import type { BulkParseResult } from '@/utils/bulk-assignments';

import { SourceStep } from '../SourceStep';

import '@/services/i18n';

vi.mock('@/utils/bulk-assignments', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/bulk-assignments')>()),
  parseWorkbook: vi.fn()
}));

const subject = (id: string, overrides: Partial<Pick<Subject, 'dateOfBirth' | 'sex'>> = {}): Subject => ({
  createdAt: new Date(2026, 0, 1),
  dateOfBirth: null,
  firstName: null,
  groupIds: ['group-1'],
  id,
  lastName: null,
  sex: null,
  updatedAt: new Date(2026, 0, 1),
  ...overrides
});

const subjects = [
  subject('Depression_Clinic$002', { dateOfBirth: new Date(1990, 4, 3), sex: 'FEMALE' }),
  subject('Depression_Clinic$001', { sex: 'MALE' }),
  subject('c'.repeat(64))
];

const workbookResult: BulkParseResult = {
  headers: ['subject_id'],
  mapping: { subject_id: 'subjectId' },
  mode: 'ID',
  preview: [{ subject_id: '001' }],
  rows: [{ subject_id: '001' }]
};

const renderSourceStep = (props: Partial<React.ComponentProps<typeof SourceStep>> = {}) => {
  const callbacks = {
    onBack: vi.fn(),
    onParsed: vi.fn(),
    onSelectedChange: vi.fn(),
    onStepChange: vi.fn(),
    onSubjectsSelected: vi.fn()
  };
  render(<SourceStep selectedIds={[]} subjectIdDisplayLength={9} subjects={subjects} {...callbacks} {...props} />);
  return callbacks;
};

const switchTo = (mode: 'FILE' | 'PASTE' | 'SELECT') => {
  fireEvent.mouseDown(screen.getByTestId(`bulk-source-mode-${mode}`));
};

// The table is not exposed to the accessibility tree until it has measured its container, which
// happy-dom never does, so rows are reached through their test ids rather than by role.
const pickerRowLabels = () =>
  screen
    .getAllByTestId('data-table-row')
    .map((row) => row.querySelector('[role="checkbox"]')!.getAttribute('aria-label'));

const rowCheckbox = (subjectId: string) => screen.getByTestId(`bulk-select-subject-${subjectId}`);

const pickerRow = (subjectId: string) => rowCheckbox(subjectId).closest<HTMLElement>('[data-testid="data-table-row"]')!;

const sortHeader = (label: string) => screen.getByText(label).closest('button')!;

const search = (value: string) => {
  fireEvent.change(screen.getByTestId('data-table-search-bar').querySelector('input')!, {
    target: { value }
  });
};

const dropFile = (file: File) => {
  fireEvent.change(screen.getByTestId('bulk-source-step').querySelector('input[type="file"]')!, {
    target: { files: [file] }
  });
};

const csvFile = (content: string) => new File([content], 'subjects.csv', { type: 'text/csv' });

const workbookFile = () =>
  new File(['workbook'], 'subjects.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

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

describe('SourceStep', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    vi.mocked(parseWorkbook).mockReset();
  });

  afterEach(cleanup);

  describe('selecting subjects', () => {
    it('should list identifiers unscoped and truncated to the group display length, as elsewhere in the app', () => {
      renderSourceStep();
      expect(pickerRowLabels()).toEqual(['002', '001', 'ccccccccc']);
    });

    it('should show date of birth and sex beside each subject, since a digest identifies nobody on sight', () => {
      renderSourceStep();
      expect(pickerRow('Depression_Clinic$002').textContent).toContain('1990-05-03');
      expect(pickerRow('Depression_Clinic$002').textContent).toContain('Female');
      expect(pickerRow('Depression_Clinic$001').textContent).toContain('Male');
    });

    it('should show missing demographics as null rather than blank', () => {
      renderSourceStep();
      expect(pickerRow('c'.repeat(64)).textContent).toBe('cccccccccNULLNULL');
    });

    it('should say so when the group has no subjects instead of rendering an empty table', () => {
      renderSourceStep({ subjects: [] });
      expect(screen.getByText('This group has no subjects.')).toBeTruthy();
      expect(screen.queryByTestId('bulk-subject-picker')).toBeNull();
    });

    it('should add a subject to the selection when its row is clicked', () => {
      const { onSelectedChange } = renderSourceStep({ selectedIds: ['Depression_Clinic$001'] });
      fireEvent.click(pickerRow('Depression_Clinic$002'));
      expect(onSelectedChange).toHaveBeenCalledWith(['Depression_Clinic$001', 'Depression_Clinic$002']);
    });

    it('should remove a selected subject when its row is clicked again', () => {
      const { onSelectedChange } = renderSourceStep({ selectedIds: ['Depression_Clinic$001'] });
      fireEvent.click(pickerRow('Depression_Clinic$001'));
      expect(onSelectedChange).toHaveBeenCalledWith([]);
    });

    it('should toggle a subject from its checkbox', () => {
      const { onSelectedChange } = renderSourceStep();
      fireEvent.click(rowCheckbox('Depression_Clinic$002'));
      expect(onSelectedChange).toHaveBeenLastCalledWith(['Depression_Clinic$002']);
    });

    it('should tick the checkbox of every subject already held by the wizard', () => {
      renderSourceStep({ selectedIds: ['Depression_Clinic$001'] });
      expect(rowCheckbox('Depression_Clinic$001').getAttribute('aria-checked')).toBe('true');
      expect(rowCheckbox('Depression_Clinic$002').getAttribute('aria-checked')).toBe('false');
    });

    it('should select every shown subject from the header checkbox, keeping those already selected', () => {
      const { onSelectedChange } = renderSourceStep({ selectedIds: ['Depression_Clinic$001'] });
      fireEvent.click(screen.getByTestId('bulk-select-all-subjects'));
      expect(onSelectedChange).toHaveBeenCalledWith(['Depression_Clinic$001', 'Depression_Clinic$002', 'c'.repeat(64)]);
    });

    it('should select only the subjects a search leaves shown, so a filter narrows a bulk selection', async () => {
      const { onSelectedChange } = renderSourceStep();
      search('002');
      await waitFor(() => expect(pickerRowLabels()).toEqual(['002']));
      fireEvent.click(screen.getByTestId('bulk-select-all-subjects'));
      expect(onSelectedChange).toHaveBeenCalledWith(['Depression_Clinic$002']);
    });

    it('should clear every shown subject from the header checkbox once all of them are selected', () => {
      const selectedIds = subjects.map(({ id }) => id);
      const { onSelectedChange } = renderSourceStep({ selectedIds });
      const selectAll = screen.getByTestId('bulk-select-all-subjects');
      expect(selectAll.getAttribute('aria-checked')).toBe('true');
      fireEvent.click(selectAll);
      expect(onSelectedChange).toHaveBeenCalledWith([]);
    });

    it('should leave the selection unchanged when a search shows no subjects, so select all is never vacuously ticked', async () => {
      const { onSelectedChange } = renderSourceStep({ selectedIds: ['Depression_Clinic$001'] });
      search('no such subject');
      await waitFor(() => expect(screen.queryAllByTestId('data-table-row')).toHaveLength(0));
      const selectAll = screen.getByTestId('bulk-select-all-subjects');
      expect(selectAll.getAttribute('aria-checked')).toBe('false');
      fireEvent.click(selectAll);
      expect(onSelectedChange).toHaveBeenCalledWith(['Depression_Clinic$001']);
    });

    it('should sort by a column ascending, then descending, as its header is clicked', () => {
      renderSourceStep();
      const header = sortHeader('Subject');
      fireEvent.click(header);
      expect(pickerRowLabels()).toEqual(['001', '002', 'ccccccccc']);
      fireEvent.click(header);
      expect(pickerRowLabels()).toEqual(['ccccccccc', '002', '001']);
    });

    it('should show which direction a column is sorted in, and dim the affordance on an unsorted one', () => {
      renderSourceStep();
      const header = sortHeader('Subject');
      const iconClass = () => header.querySelector('svg')!.getAttribute('class');
      expect(iconClass()).toContain('lucide-chevrons-up-down');
      expect(iconClass()).toContain('opacity-40');
      fireEvent.click(header);
      expect(iconClass()).toContain('lucide-chevron-up');
      expect(iconClass()).not.toContain('opacity-40');
      fireEvent.click(header);
      expect(iconClass()).toContain('lucide-chevron-down');
    });

    it('should disable continuing until a subject is selected', () => {
      renderSourceStep();
      const continueButton = screen.getByTestId<HTMLButtonElement>('bulk-use-selected-subjects');
      expect(continueButton.disabled).toBe(true);
      expect(continueButton.textContent).toBe('Continue With Selected');
    });

    it('should continue with the selected subjects and show how many there are', () => {
      const { onSubjectsSelected } = renderSourceStep({
        selectedIds: ['Depression_Clinic$001', 'Depression_Clinic$002']
      });
      const continueButton = screen.getByTestId('bulk-use-selected-subjects');
      expect(continueButton.textContent).toBe('Continue With Selected (2)');
      fireEvent.click(continueButton);
      expect(onSubjectsSelected).toHaveBeenCalledWith(['Depression_Clinic$001', 'Depression_Clinic$002']);
    });

    it('should refuse a selection over the bulk limit and say why', () => {
      renderSourceStep({ selectedIds: Array.from({ length: 501 }, (_, index) => `subject-${index}`) });
      expect(screen.getByText('Selection is limited to 500 subjects')).toBeTruthy();
      expect(screen.getByTestId<HTMLButtonElement>('bulk-use-selected-subjects').disabled).toBe(true);
    });
  });

  describe('back button', () => {
    it('should offer a way back in every source mode when the page supplies one', () => {
      const { onBack } = renderSourceStep();
      fireEvent.click(screen.getByText('Back'));
      switchTo('FILE');
      fireEvent.click(screen.getByText('Back'));
      switchTo('PASTE');
      fireEvent.click(screen.getByText('Back'));
      expect(onBack).toHaveBeenCalledTimes(3);
    });

    it('should render no footer for a file upload when there is nowhere to go back to', () => {
      renderSourceStep({ onBack: undefined });
      switchTo('FILE');
      expect(screen.queryByText('Back')).toBeNull();
      expect(screen.queryByRole('button', { name: /Continue/ })).toBeNull();
    });
  });

  describe('uploading a file', () => {
    it('should parse a delimited file as text', async () => {
      const { onParsed } = renderSourceStep();
      switchTo('FILE');
      dropFile(csvFile('subject_id\n001\n002'));
      await waitFor(() => expect(onParsed).toHaveBeenCalledOnce());
      expect(onParsed.mock.lastCall![0]).toMatchObject({
        headers: ['subject_id'],
        mode: 'ID',
        rows: [{ subject_id: '001' }, { subject_id: '002' }]
      });
      expect(parseWorkbook).not.toHaveBeenCalled();
    });

    it('should parse an Excel file as a workbook', async () => {
      vi.mocked(parseWorkbook).mockResolvedValue(workbookResult);
      const { onParsed } = renderSourceStep();
      switchTo('FILE');
      const file = workbookFile();
      dropFile(file);
      await waitFor(() => expect(onParsed).toHaveBeenCalledWith(workbookResult));
      expect(parseWorkbook).toHaveBeenCalledWith(file);
    });

    it('should list the reasons a file could not be parsed instead of continuing', async () => {
      vi.mocked(parseWorkbook).mockRejectedValue(
        new BulkParseFailure([{ message: 'The workbook contains no sheets.' }])
      );
      const { onParsed } = renderSourceStep();
      switchTo('FILE');
      dropFile(workbookFile());
      expect((await screen.findByTestId('bulk-error-list')).textContent).toContain('The workbook contains no sheets.');
      expect(onParsed).not.toHaveBeenCalled();
    });

    it('should clear parse errors when the user switches to another source', async () => {
      vi.mocked(parseWorkbook).mockRejectedValue(
        new BulkParseFailure([{ message: 'The workbook contains no sheets.' }])
      );
      renderSourceStep();
      switchTo('FILE');
      dropFile(workbookFile());
      await screen.findByTestId('bulk-error-list');
      switchTo('PASTE');
      expect(screen.queryByTestId('bulk-error-list')).toBeNull();
    });

    it('should rethrow an unexpected error rather than show it as a parse problem, so it is never swallowed', async () => {
      const unexpected = new Error('unexpected');
      vi.mocked(parseWorkbook).mockRejectedValue(unexpected);
      renderSourceStep();
      switchTo('FILE');
      await expect(captureUnhandledRejection(() => dropFile(workbookFile()))).resolves.toBe(unexpected);
      expect(screen.queryByTestId('bulk-error-list')).toBeNull();
    });
  });

  describe('pasting data', () => {
    it('should disable parsing until something other than whitespace is pasted', () => {
      renderSourceStep();
      switchTo('PASTE');
      const parseButton = screen.getByTestId<HTMLButtonElement>('bulk-parse-pasted');
      expect(parseButton.disabled).toBe(true);
      fireEvent.change(screen.getByTestId('bulk-paste-input'), { target: { value: '  \n ' } });
      expect(parseButton.disabled).toBe(true);
    });

    it('should parse the pasted text', async () => {
      const { onParsed } = renderSourceStep();
      switchTo('PASTE');
      fireEvent.change(screen.getByTestId('bulk-paste-input'), { target: { value: 'subject_id\n001' } });
      fireEvent.click(screen.getByTestId('bulk-parse-pasted'));
      await waitFor(() => expect(onParsed).toHaveBeenCalledOnce());
      expect(onParsed.mock.lastCall![0]).toMatchObject({ rows: [{ subject_id: '001' }] });
    });

    it('should list the reasons pasted text could not be parsed', async () => {
      const { onParsed } = renderSourceStep();
      switchTo('PASTE');
      fireEvent.change(screen.getByTestId('bulk-paste-input'), { target: { value: 'subject_id\n"001' } });
      fireEvent.click(screen.getByTestId('bulk-parse-pasted'));
      expect((await screen.findByTestId('bulk-error-list')).textContent).toContain('Quoted field unterminated');
      expect(onParsed).not.toHaveBeenCalled();
    });
  });
});

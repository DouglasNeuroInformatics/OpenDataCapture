import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorkBook } from 'xlsx';
import { utils, writeFileXLSX } from 'xlsx';

import { downloadSubjectTableExcel, EXCEL_MAX_DATA_ROWS, ExcelRowLimitExceededError } from '../excel';

vi.mock('xlsx', async (importOriginal) => ({
  ...(await importOriginal<typeof import('xlsx')>()),
  writeFileXLSX: vi.fn()
}));

/** The workbook and filename handed to the browser download, from the most recent call. */
const lastDownload = (): { filename: string; workbook: WorkBook } => {
  const [workbook, filename] = vi.mocked(writeFileXLSX).mock.lastCall!;
  return { filename, workbook };
};

const sheetNameFor = (name: string) => {
  downloadSubjectTableExcel('subject.xlsx', [{ score: 1 }], name);
  return lastDownload().workbook.SheetNames[0];
};

describe('downloadSubjectTableExcel', () => {
  afterEach(() => {
    vi.mocked(writeFileXLSX).mockClear();
  });

  it('should write the records into a sheet named after the subject table', () => {
    const records = [{ score: 12, subjectId: 'subject-1' }];
    downloadSubjectTableExcel('subject.xlsx', records, 'Subject 1');
    const { filename, workbook } = lastDownload();
    expect(filename).toBe('subject.xlsx');
    expect(utils.sheet_to_json(workbook.Sheets['Subject 1']!)).toEqual(records);
  });

  it('should replace the characters a sheet name cannot contain', () => {
    expect(sheetNameFor('a\\b/c?d*e[f]g:h')).toBe('a_b_c_d_e_f_g_h');
  });

  it('should truncate the name to the 31 characters a sheet name allows', () => {
    expect(sheetNameFor('x'.repeat(40))).toBe('x'.repeat(31));
  });

  it('should strip a leading and trailing apostrophe, which a sheet name cannot start or end with', () => {
    expect(sheetNameFor("'quoted'")).toBe('quoted');
  });

  it('should trim surrounding whitespace', () => {
    expect(sheetNameFor('  padded  ')).toBe('padded');
  });

  it('should fall back to a generic sheet name when nothing usable remains', () => {
    expect(sheetNameFor("'")).toBe('Subject');
  });

  it('should refuse to build a subject worksheet exceeding Excel row capacity', () => {
    const oversized = new Array<{ [key: string]: unknown }>(EXCEL_MAX_DATA_ROWS + 1);
    expect(() => downloadSubjectTableExcel('subject.xlsx', oversized, 'Records')).toThrow(ExcelRowLimitExceededError);
    expect(writeFileXLSX).not.toHaveBeenCalled();
  });
});

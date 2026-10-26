import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorkBook } from 'xlsx';
import { utils, writeFileXLSX } from 'xlsx';

import { downloadExcel, downloadSubjectTableExcel } from '../excel';

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

const recordsExport: InstrumentRecordsExport = [
  {
    groupId: 'group-1',
    instrumentEdition: 1,
    instrumentName: 'HAPPINESS_QUESTIONNAIRE',
    measure: 'overallHappiness',
    seriesId: null,
    seriesName: null,
    sessionDate: '2026-01-01',
    sessionId: 'session-1',
    sessionType: 'IN_PERSON',
    subjectAge: 30,
    subjectId: 'subject-1',
    subjectSex: 'MALE',
    timestamp: '2026-01-01T12:00:00.000Z',
    username: 'admin',
    value: 7
  }
];

afterEach(() => {
  vi.mocked(writeFileXLSX).mockClear();
});

describe('downloadExcel', () => {
  it('should download the workbook under the given filename', () => {
    downloadExcel('records.xlsx', recordsExport);
    expect(lastDownload().filename).toBe('records.xlsx');
  });

  it('should write every exported record into a single ULTRA_LONG sheet', () => {
    downloadExcel('records.xlsx', recordsExport);
    const { workbook } = lastDownload();
    expect(workbook.SheetNames).toEqual(['ULTRA_LONG']);
    expect(utils.sheet_to_json(workbook.Sheets.ULTRA_LONG!)).toEqual(recordsExport);
  });
});

describe('downloadSubjectTableExcel', () => {
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
});

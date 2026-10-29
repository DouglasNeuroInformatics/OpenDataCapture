import { generateSubjectHash } from '@opendatacapture/subject-utils';
import { describe, expect, it, vi } from 'vitest';
import { read, utils, write } from 'xlsx';

import {
  assertFileSize,
  buildResultRows,
  BulkParseFailure,
  isWorkbookFile,
  parseDelimitedText,
  parseEmailListText,
  parseEmailListWorkbook,
  parseWorkbook,
  resolveEmailList,
  resolveSubjectIds,
  resultCsvFilename,
  toResultCsv,
  toResultTsv
} from '../bulk-assignments';

import type { CanonicalField } from '../bulk-assignments';

vi.mock('xlsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('xlsx')>();
  return { ...actual, read: vi.fn(actual.read) };
});

/** The ids a resolve kept, which is what most of these tests are about. */
const resolvedIds = async (...args: Parameters<typeof resolveSubjectIds>) => {
  return (await resolveSubjectIds(...args)).matched.map(({ id }) => id);
};

const resolve = (input: string, maxSubjects = 500) => resolvedIds(parseDelimitedText(input), { maxSubjects });

/** The errors carried by a rejected parse, so a test can assert on row numbers and wording. */
const failureOf = async (run: () => unknown) => {
  try {
    await run();
  } catch (err) {
    if (err instanceof BulkParseFailure) {
      return err.errors;
    }
    throw err;
  }
  throw new Error('Expected the parse to fail, but it succeeded');
};

describe('parseDelimitedText', () => {
  it('should parse comma-separated content', () => {
    const result = parseDelimitedText('subjectId\nsubject-1\nsubject-2');
    expect(result.mode).toBe('ID');
    expect(result.rows).toHaveLength(2);
  });

  it('should parse tab-separated content, so a .tsv export can be used directly', () => {
    const result = parseDelimitedText('subjectId\tsex\nsubject-1\tM');
    expect(result.mode).toBe('ID');
    expect(result.rows[0]).toMatchObject({ subjectId: 'subject-1' });
  });

  it('should parse semicolon-separated content', () => {
    const result = parseDelimitedText('subjectId;sex\nsubject-1;M');
    expect(result.rows[0]).toMatchObject({ subjectId: 'subject-1' });
  });

  it('should match headers case-insensitively and ignore punctuation, spacing and accents', () => {
    const result = parseDelimitedText('  Date De Naissance ,PRÉNOM,nom_de_famille,Sexe\n2000-01-01,Jean,Tremblay,M');
    expect(result.mode).toBe('PII');
    expect(Object.values(result.mapping).sort()).toEqual(['dateOfBirth', 'firstName', 'lastName', 'sex']);
  });

  it('should recognize French aliases for the subject id', () => {
    expect(parseDelimitedText('identifiant\nsubject-1').mode).toBe('ID');
  });

  it('should ignore columns that map to nothing but auto-detect email as a canonical field', () => {
    const result = parseDelimitedText('subjectId,email,notes\nsubject-1,a@b.co,hello');
    expect(result.mapping).toEqual({ email: 'email', subjectId: 'subjectId' });
  });

  it('should skip rows that are entirely empty rather than treating them as subjects', () => {
    const result = parseDelimitedText('subjectId\nsubject-1\n\nsubject-2\n');
    expect(result.rows).toHaveLength(2);
  });

  it('should preview at most the first four rows', () => {
    const result = parseDelimitedText(`subjectId\n${Array.from({ length: 10 }, (_, i) => `s-${i}`).join('\n')}`);
    expect(result.preview).toHaveLength(4);
    expect(result.rows).toHaveLength(10);
  });

  it('should reject two columns claiming the same field, which would make the mapping ambiguous', async () => {
    const errors = await failureOf(() => parseDelimitedText('nom,lastName\nTremblay,Smith'));
    expect(errors[0]?.message).toContain('lastName');
  });

  it('should reject content with no recognizable subject column', async () => {
    const errors = await failureOf(() => parseDelimitedText('height,weight\n180,80'));
    expect(errors[0]?.message).toContain('Could not find a subject ID column');
  });

  it('should reject partial PII, since a hash cannot be derived from some of the four fields', async () => {
    const errors = await failureOf(() => parseDelimitedText('firstName,lastName\nJean,Tremblay'));
    expect(errors[0]?.message).toContain('Could not find a subject ID column');
  });

  it('should reject headers with no data rows', async () => {
    const errors = await failureOf(() => parseDelimitedText('subjectId\n'));
    expect(errors[0]?.message).toContain('no data rows');
  });

  it('should reject empty input, which has no header row to map', async () => {
    const errors = await failureOf(() => parseDelimitedText('   '));
    expect(errors[0]?.message).toContain('No columns were found');
  });

  it("should reject malformed quoting with the parser's error message", async () => {
    const errors = await failureOf(() => parseDelimitedText('subjectId\n"subject-1'));
    expect(errors).toEqual([{ message: 'Quoted field unterminated', row: 2 }]);
  });

  it('should number a malformed line as the user sees it in their file, counting the header as row 1', async () => {
    const errors = await failureOf(() => parseDelimitedText('subjectId\na\nb\n"c'));
    expect(errors).toEqual([{ message: 'Quoted field unterminated', row: 4 }]);
  });
});

describe('resolveSubjectIds', () => {
  it('should return ids unchanged in ID mode', async () => {
    await expect(resolve('subjectId\nsubject-1\nsubject-2')).resolves.toEqual(['subject-1', 'subject-2']);
  });

  it('should derive ids matching real generateSubjectHash output, never a reimplementation of it', async () => {
    const expected = await generateSubjectHash({
      dateOfBirth: new Date('2000-01-01T00:00:00.000Z'),
      firstName: 'Jean',
      lastName: 'Tremblay',
      sex: 'MALE'
    });
    await expect(resolve('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2000-01-01,M')).resolves.toEqual([
      expected
    ]);
  });

  it.each([
    ['M', 'MALE'],
    ['male', 'MALE'],
    ['Homme', 'MALE'],
    ['F', 'FEMALE'],
    ['Femme', 'FEMALE'],
    ['féminin', 'FEMALE']
  ])('should normalize sex value "%s"', async (input, normalized) => {
    const expected = await generateSubjectHash({
      dateOfBirth: new Date('2000-01-01T00:00:00.000Z'),
      firstName: 'Jean',
      lastName: 'Tremblay',
      sex: normalized as 'FEMALE' | 'MALE'
    });
    await expect(resolve(`firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2000-01-01,${input}`)).resolves.toEqual([
      expected
    ]);
  });

  it('should reject an unknown sex value rather than guessing', async () => {
    const errors = await failureOf(() => resolve('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2000-01-01,X'));
    expect(errors[0]).toMatchObject({ row: 2 });
    expect(errors[0]?.message).toContain('male or female');
  });

  it('should reject an ambiguous date, since 03/04 means different days in different locales', async () => {
    const errors = await failureOf(() => resolve('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,03/04/2001,M'));
    expect(errors[0]).toMatchObject({ message: 'Date of birth must be written as YYYY-MM-DD', row: 2 });
  });

  it('should reject an ISO-shaped date that is not a real day', async () => {
    const errors = await failureOf(() => resolve('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2001-13-45,M'));
    expect(errors[0]).toMatchObject({ row: 2 });
  });

  it('should reject a date that Date normalizes silently, like Feb 29 in a non-leap year', async () => {
    const errors = await failureOf(() => resolve('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2001-02-29,M'));
    expect(errors[0]).toMatchObject({ message: 'Date of birth is not a real date', row: 2 });
  });

  it('should number errors by the row of the user file, counting the header as row 1', async () => {
    const errors = await failureOf(() => {
      return resolve('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2000-01-01,M\nAnne,Roy,2000-01-02,X');
    });
    expect(errors[0]).toMatchObject({ row: 3 });
  });

  it('should reject a PII row with a blank field, since a hash cannot be derived from it', async () => {
    const errors = await failureOf(() => resolve('firstName,lastName,dateOfBirth,sex\nJean,,2000-01-01,M'));
    expect(errors[0]).toMatchObject({ message: 'Missing first name, last name, date of birth or sex', row: 2 });
  });

  it('should reject a missing id in ID mode', async () => {
    const errors = await failureOf(() => resolve('subjectId,notes\n,hello'));
    expect(errors[0]).toMatchObject({ message: 'Missing subject ID', row: 2 });
  });

  it('should reject duplicate ids', async () => {
    const errors = await failureOf(() => resolve('subjectId\nsubject-1\nsubject-1'));
    expect(errors[0]?.message).toContain('more than once');
  });

  it('should reject two PII rows describing the same person, which resolve to one id', async () => {
    const errors = await failureOf(() => {
      return resolve('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2000-01-01,M\nJean,Tremblay,2000-01-01,M');
    });
    expect(errors[0]?.message).toContain('more than once');
  });

  it('should accept exactly the maximum number of subjects', async () => {
    const rows = Array.from({ length: 500 }, (_, index) => `subject-${index}`).join('\n');
    await expect(resolve(`subjectId\n${rows}`, 500)).resolves.toHaveLength(500);
  });

  it('should reject one subject beyond the maximum', async () => {
    const rows = Array.from({ length: 501 }, (_, index) => `subject-${index}`).join('\n');
    const errors = await failureOf(() => resolve(`subjectId\n${rows}`, 500));
    expect(errors[0]?.message).toContain('limited to 500 subjects');
  });

  it('should never surface personal information in an error message', async () => {
    const errors = await failureOf(() => resolve('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2000-01-01,X'));
    const combined = errors.map(({ message }) => message).join(' ');
    expect(combined).not.toContain('Jean');
    expect(combined).not.toContain('Tremblay');
    expect(combined).not.toContain('2000-01-01');
  });

  describe('identifier forms', () => {
    const idCsv = (value: string) => parseDelimitedText(`subjectId\n${value}`);

    it('should scope a custom identifier written the way the app displays it', async () => {
      await expect(resolvedIds(idCsv('ex_111'), { groupName: 'Depression Clinic', maxSubjects: 10 })).resolves.toEqual([
        'Depression_Clinic$ex_111'
      ]);
    });

    it('should leave an already scoped identifier alone', async () => {
      await expect(
        resolvedIds(idCsv('Depression_Clinic$ex_111'), { groupName: 'Depression Clinic', maxSubjects: 10 })
      ).resolves.toEqual(['Depression_Clinic$ex_111']);
    });

    it('should leave a generated digest alone, since those are never scoped', async () => {
      const digest = 'a'.repeat(64);
      await expect(resolvedIds(idCsv(digest), { groupName: 'Depression Clinic', maxSubjects: 10 })).resolves.toEqual([
        digest
      ]);
    });

    it('should pass values through unchanged when no group is known', async () => {
      await expect(resolvedIds(idCsv('ex_111'), { maxSubjects: 10 })).resolves.toEqual(['ex_111']);
    });

    it('should match a truncated identifier against known subjects by prefix', async () => {
      const fullId = 'a'.repeat(64);
      await expect(
        resolvedIds(idCsv('aaaaaaaaa'), {
          groupName: 'Depression Clinic',
          knownSubjectIds: [fullId],
          maxSubjects: 10
        })
      ).resolves.toEqual([fullId]);
    });

    it('should report an ambiguous truncated identifier as ambiguous, rather than guess one of the subjects', async () => {
      const id1 = 'a'.repeat(64);
      const id2 = `${'a'.repeat(63)}b`;
      const resolution = await resolveSubjectIds(idCsv('aaaaaaaaa'), {
        groupName: 'Depression Clinic',
        knownSubjectIds: [id1, id2],
        maxSubjects: 10
      });
      expect(resolution).toEqual({ ambiguousRows: [2], matched: [], unknownRows: [] });
    });

    it('should report a row naming a subject the group does not have, so a stranger is caught before the API', async () => {
      const resolution = await resolveSubjectIds(idCsv('ex_111'), {
        groupName: 'Depression Clinic',
        knownSubjectIds: ['Depression_Clinic$ex_222'],
        maxSubjects: 10
      });
      expect(resolution).toEqual({ ambiguousRows: [], matched: [], unknownRows: [2] });
    });

    it('should keep the rows the group can place beside the ones it cannot, so the caller can skip them', async () => {
      const parsed = parseDelimitedText('subjectId\nex_111\nex_222');
      const resolution = await resolveSubjectIds(parsed, {
        groupName: 'Depression Clinic',
        knownSubjectIds: ['Depression_Clinic$ex_222'],
        maxSubjects: 10
      });
      expect(resolution).toEqual({
        ambiguousRows: [],
        matched: [{ id: 'Depression_Clinic$ex_222', rowNumber: 3 }],
        unknownRows: [2]
      });
    });

    it('should report personal information the group cannot place by row, never by name', async () => {
      const parsed = parseDelimitedText('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2000-01-01,M');
      const resolution = await resolveSubjectIds(parsed, { knownSubjectIds: [], maxSubjects: 10 });
      expect(resolution).toEqual({ ambiguousRows: [], matched: [], unknownRows: [2] });
    });
  });
});

describe('isWorkbookFile', () => {
  it('should route only .xlsx through the dynamic import branch', () => {
    expect(isWorkbookFile(new File([''], 'subjects.xlsx'))).toBe(true);
    expect(isWorkbookFile(new File([''], 'SUBJECTS.XLSX'))).toBe(true);
    expect(isWorkbookFile(new File([''], 'subjects.csv'))).toBe(false);
    expect(isWorkbookFile(new File([''], 'subjects.tsv'))).toBe(false);
  });
});

describe('toResultCsv', () => {
  it('should neutralize a value that a spreadsheet would otherwise execute as a formula', () => {
    const csv = toResultCsv([{ status: '=1+1', subjectId: 'subject-1' }]);
    expect(csv).not.toMatch(/,=1\+1/);
    expect(csv).toContain("'=1+1");
  });

  it('should round-trip ordinary values', () => {
    expect(toResultCsv([{ status: 'CREATED', subjectId: 'subject-1' }])).toContain('subject-1');
  });
});

describe('resultCsvFilename', () => {
  it('should stamp the file with the date and time it was downloaded', () => {
    const name = resultCsvFilename(new Date(2026, 8, 9, 15, 44, 12));
    expect(name).toBe('bulk-remote-assignments-2026-09-09T15-44-12.csv');
  });

  it('should carry no colon, which a filename cannot contain on Windows', () => {
    expect(resultCsvFilename(new Date(2026, 0, 2, 3, 4, 5))).not.toContain(':');
  });

  it('should read the local clock rather than UTC, so the name matches when the user downloaded it', () => {
    // Constructed in local time; the stamp must echo those same wall-clock digits back regardless
    // of the machine's offset from UTC.
    const name = resultCsvFilename(new Date(2026, 0, 2, 23, 30, 0));
    expect(name).toContain('2026-01-02T23-30-00');
  });
});

describe('buildResultRows', () => {
  const assignment = {
    expiresAt: '2027-09-10T23:59:59.999Z',
    instrumentId: '__V2__0c5b9177a7df14b3',
    subjectId: 'subject-1',
    url: 'http://localhost:3500/assignments/a1'
  };

  it('should render the expiry as a plain date rather than a timestamp', () => {
    const [row] = buildResultRows({ assignments: [assignment], instrumentTitleById: {} });
    expect(row?.expiresAt).toBe('2027-09-10');
  });

  it('should name the instrument rather than exporting its id, which reads as noise', () => {
    const [row] = buildResultRows({
      assignments: [assignment],
      instrumentTitleById: { __V2__0c5b9177a7df14b3: 'Happiness Questionnaire' }
    });
    expect(row?.instrument).toBe('Happiness Questionnaire');
  });

  it('should fall back to the id when the instrument is not among those offered', () => {
    const [row] = buildResultRows({ assignments: [assignment], instrumentTitleById: {} });
    expect(row?.instrument).toBe('__V2__0c5b9177a7df14b3');
  });

  it('should echo back the uploaded row, so a hashed identifier can be traced to a person', () => {
    const [row] = buildResultRows({
      assignments: [assignment],
      instrumentTitleById: {},
      sourceRowBySubjectId: { 'subject-1': { dateOfBirth: '1982-03-14', firstName: 'Marie', lastName: 'Belanger' } }
    });
    expect(row).toMatchObject({
      dateOfBirth: '1982-03-14',
      firstName: 'Marie',
      lastName: 'Belanger',
      url: 'http://localhost:3500/assignments/a1'
    });
  });

  it('should emit one row per assignment, so a subject appears once per instrument', () => {
    const rows = buildResultRows({
      assignments: [assignment, { ...assignment, instrumentId: 'other', url: 'http://x/a2' }],
      instrumentTitleById: {}
    });
    expect(rows).toHaveLength(2);
  });

  describe('subject columns', () => {
    it('should carry the identifier untruncated, since a prefix cannot be pasted back in', () => {
      const [row] = buildResultRows({
        assignments: [
          {
            expiresAt: '2027-09-10T23:59:59.999Z',
            instrumentId: 'i1',
            subjectId: 'a'.repeat(64),
            url: 'http://x/a1'
          }
        ],
        instrumentTitleById: {}
      });
      expect(row?.subject).toBe('a'.repeat(64));
    });

    it('should strip the group scope from a custom identifier, as the app does', () => {
      const [row] = buildResultRows({
        assignments: [
          { expiresAt: '2027-01-01', instrumentId: 'i1', subjectId: 'Depression_Clinic$ex_111', url: 'http://x/a1' }
        ],
        instrumentTitleById: {}
      });
      expect(row?.subject).toBe('ex_111');
    });

    describe('result column order', () => {
      it('should lead every row with the subject, ahead of the uploaded columns', () => {
        const [row] = buildResultRows({
          assignments: [{ expiresAt: '2027-01-01', instrumentId: 'i1', subjectId: 'subject-1', url: 'http://x/a1' }],
          instrumentTitleById: {},
          sourceRowBySubjectId: { 'subject-1': { firstName: 'Marie', lastName: 'Belanger' } }
        });
        // Pinned because `perfectionist` sorts object literals; the spread is what keeps this first.
        expect(Object.keys(row!)[0]).toBe('subject');
      });

      it('should put the subject first in the clipboard table too', () => {
        const rows = buildResultRows({
          assignments: [{ expiresAt: '2027-01-01', instrumentId: 'i1', subjectId: 'subject-1', url: 'http://x/a1' }],
          instrumentTitleById: {},
          sourceRowBySubjectId: { 'subject-1': { firstName: 'Marie' } }
        });
        expect(toResultTsv(rows).split('\n')[0]?.split('\t')[0]).toBe('subject');
      });
    });
  });
});

describe('toResultTsv', () => {
  it('should carry the same columns as the download, tab separated so it pastes as columns', () => {
    const rows = buildResultRows({
      assignments: [
        {
          expiresAt: '2027-01-01',
          instrumentId: 'i1',
          subjectId: 'Depression_Clinic$ex_111',
          url: 'http://x/a1'
        }
      ],
      instrumentTitleById: { i1: 'Happiness Questionnaire' },
      sourceRowBySubjectId: { Depression_Clinic$ex_111: { firstName: 'Marie', lastName: 'Belanger' } }
    });
    const [header, row] = toResultTsv(rows).split('\n');

    // The personal information the user supplied has to come back with the link, or the clipboard
    // cannot be matched against their own file.
    expect(header).toContain('firstName');
    expect(header).toContain('url');
    expect(header?.split('\t').length).toBe(row?.split('\t').length);
    expect(row).toContain('Marie');
    expect(row).toContain('http://x/a1');
  });

  it('should no longer carry the full identifier, only the displayed one', () => {
    const rows = buildResultRows({
      assignments: [{ expiresAt: '2027-01-01', instrumentId: 'i1', subjectId: 'a'.repeat(64), url: 'http://x/a1' }],
      instrumentTitleById: {}
    });
    expect(Object.keys(rows[0]!)).not.toContain('subjectId');
    expect(rows[0]?.subject).toBe('a'.repeat(64));
  });
});

describe('assertFileSize', () => {
  it('should accept a file at exactly the size limit', () => {
    expect(() => assertFileSize(new File([new Uint8Array(5_000_000)], 'subjects.csv'))).not.toThrow();
  });

  it('should refuse a file over the size limit before it is read, so the tab cannot lock up', async () => {
    const errors = await failureOf(() => assertFileSize(new File([new Uint8Array(5_000_001)], 'subjects.csv')));
    expect(errors[0]?.message).toBe('File is larger than the 5 MB limit.');
  });
});

describe('parseWorkbook', () => {
  /** A real .xlsx file whose first sheet holds the given rows, the first of which is the header. */
  const workbookFile = (rows: unknown[][]) => {
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows, { cellDates: true }), 'Subjects');
    const bytes: ArrayBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    return new File([bytes], 'subjects.xlsx');
  };

  it('should parse the first sheet of a workbook', async () => {
    const result = await parseWorkbook(workbookFile([['subjectId'], ['subject-1'], ['subject-2']]));
    expect(result.mode).toBe('ID');
    expect(result.rows).toEqual([{ subjectId: 'subject-1' }, { subjectId: 'subject-2' }]);
  });

  it('should trim headers and values, so a padded cell maps and matches like a clean one', async () => {
    const result = await parseWorkbook(workbookFile([[' Subject ID '], ['  subject-1  ']]));
    expect(result.mapping).toEqual({ 'Subject ID': 'subjectId' });
    expect(result.rows).toEqual([{ 'Subject ID': 'subject-1' }]);
  });

  it('should write a date cell as an ISO date, so it passes the date of birth validation', async () => {
    const result = await parseWorkbook(
      workbookFile([
        ['firstName', 'lastName', 'dateOfBirth', 'sex'],
        ['Jean', 'Tremblay', new Date(Date.UTC(1982, 2, 14)), 'M']
      ])
    );
    expect(result.rows[0]?.dateOfBirth).toBe('1982-03-14');
  });

  it('should stringify number and boolean cells', async () => {
    const result = await parseWorkbook(
      workbookFile([
        ['subjectId', 'visit', 'consented'],
        [1001, 2, true]
      ])
    );
    expect(result.rows).toEqual([{ consented: 'true', subjectId: '1001', visit: '2' }]);
  });

  it('should read an error cell as blank rather than as its error code', async () => {
    const file = workbookFile([
      ['subjectId', 'score'],
      ['subject-1', 0]
    ]);
    const workbook = read(await file.arrayBuffer(), { type: 'array' });
    workbook.Sheets.Subjects!.B2 = { t: 'e', v: 0 };
    const bytes: ArrayBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const result = await parseWorkbook(new File([bytes], 'subjects.xlsx'));
    expect(result.rows).toEqual([{ score: '', subjectId: 'subject-1' }]);
  });

  it('should reject a sheet holding only a header row', async () => {
    const errors = await failureOf(() => parseWorkbook(workbookFile([['subjectId']])));
    expect(errors[0]?.message).toContain('No columns were found');
  });

  it('should reject a file that cannot be read as a workbook', async () => {
    const corrupt = new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4, 5, 6, 7, 8, 9])], 'subjects.xlsx');
    const errors = await failureOf(() => parseWorkbook(corrupt));
    expect(errors[0]?.message).toBe('The file could not be read as a workbook. It may be corrupt or unsupported.');
  });

  it('should reject a workbook without any sheets', async () => {
    vi.mocked(read).mockReturnValueOnce({ SheetNames: [], Sheets: {} });
    const errors = await failureOf(() => parseWorkbook(workbookFile([['subjectId'], ['subject-1']])));
    expect(errors[0]?.message).toBe('The workbook contains no sheets.');
  });

  it('should refuse an oversized file without reading it', async () => {
    vi.mocked(read).mockClear();
    const errors = await failureOf(() => parseWorkbook(new File([new Uint8Array(5_000_001)], 'subjects.xlsx')));
    expect(errors[0]?.message).toContain('5 MB limit');
    expect(read).not.toHaveBeenCalled();
  });
});

describe('resolveEmailList', () => {
  const knownSubjectIds = ['GroupA$alice123', 'GroupA$bob456'];
  /** The mapping the user confirmed on the upload panel, typed as that panel hands it over. */
  const mapping: Partial<{ [key: string]: CanonicalField }> = { email: 'email', subject_id: 'subjectId' };

  it('should match subject IDs to known subjects and extract emails', () => {
    const rows = [
      { email: 'alice@example.com', subject_id: 'alice123' },
      { email: 'bob@example.com', subject_id: 'bob456' }
    ];
    const result = resolveEmailList(rows, mapping, { groupName: 'GroupA', knownSubjectIds });
    expect(result.emails).toEqual({ GroupA$alice123: 'alice@example.com', GroupA$bob456: 'bob@example.com' });
    expect(result.missingEmail).toEqual([]);
    expect(result.unmatched).toEqual([]);
  });

  it('should count rather than keep a row whose subject ID does not match any known subject', () => {
    const rows = [
      { email: 'alice@example.com', subject_id: 'alice123' },
      { email: 'unknown@example.com', subject_id: 'nobody' }
    ];
    const result = resolveEmailList(rows, mapping, { groupName: 'GroupA', knownSubjectIds });
    expect(result.emails).toEqual({ GroupA$alice123: 'alice@example.com' });
    expect(result.unmatched).toEqual(['nobody']);
  });

  it('should return an empty object when the mapping lacks a subject ID or email column', () => {
    const rows = [{ email: 'alice@example.com', subject_id: 'alice123' }];
    expect(resolveEmailList(rows, { subject_id: 'subjectId' }, { groupName: 'GroupA', knownSubjectIds })).toEqual({
      emails: {},
      missingEmail: [],
      unmatched: []
    });
    expect(resolveEmailList(rows, { email: 'email' }, { groupName: 'GroupA', knownSubjectIds })).toEqual({
      emails: {},
      missingEmail: [],
      unmatched: []
    });
  });

  // A row naming an existing subject with no address is a gap the user can act on; a row naming
  // nobody is attributable to no subject at all, so there is nothing to report about it.
  it('should count an existing subject left without an address, and pass over a row naming nobody', () => {
    const rows = [
      { email: '', subject_id: 'alice123' },
      { email: 'bob@example.com', subject_id: '' }
    ];
    const result = resolveEmailList(rows, mapping, { groupName: 'GroupA', knownSubjectIds });
    expect(result.emails).toEqual({});
    expect(result.missingEmail).toEqual(['GroupA$alice123']);
    expect(result.unmatched).toEqual([]);
  });

  // Each count has to name its own reason: "does not exist" and "exists but has no address" are
  // different things for the user to fix.
  it('should count a missing subject apart from one found without an address', () => {
    const rows = [
      { email: 'alice@example.com', subject_id: 'alice123' },
      { email: '', subject_id: 'bob456' },
      { email: 'ghost@example.com', subject_id: 'nobody' }
    ];
    const result = resolveEmailList(rows, mapping, { groupName: 'GroupA', knownSubjectIds });
    expect(result.emails).toEqual({ GroupA$alice123: 'alice@example.com' });
    expect(result.missingEmail).toEqual(['GroupA$bob456']);
    expect(result.unmatched).toEqual(['nobody']);
  });

  // The counts name subjects, so the same subject on two rows is one entry, and a subject given an
  // address on either row is not reported as missing one.
  it('should report each subject once, however many rows name it', () => {
    const rows = [
      { email: '', subject_id: 'bob456' },
      { email: 'bob@example.com', subject_id: 'bob456' },
      { email: 'ghost@example.com', subject_id: 'nobody' },
      { email: '', subject_id: 'nobody' }
    ];
    const result = resolveEmailList(rows, mapping, { groupName: 'GroupA', knownSubjectIds });
    expect(result.emails).toEqual({ GroupA$bob456: 'bob@example.com' });
    expect(result.missingEmail).toEqual([]);
    expect(result.unmatched).toEqual(['nobody']);
  });

  it('should match truncated subject IDs via prefix matching', () => {
    const rows = [{ email: 'alice@example.com', subject_id: 'alice' }];
    const result = resolveEmailList(rows, mapping, { groupName: 'GroupA', knownSubjectIds });
    expect(result.emails).toEqual({ GroupA$alice123: 'alice@example.com' });
  });
});

describe('parseEmailListText', () => {
  it('should parse delimited text and return headers, rows and a best-guess mapping', () => {
    const result = parseEmailListText('subject_id,email\nalice,alice@x.com\nbob,bob@x.com');
    expect(result.headers).toEqual(['subject_id', 'email']);
    expect(result.rows).toHaveLength(2);
    expect(result.mapping).toMatchObject({ email: 'email', subject_id: 'subjectId' });
  });

  it('should reject input with no columns', () => {
    expect(() => parseEmailListText('')).toThrow(BulkParseFailure);
  });

  it('should reject input with headers but no data rows', () => {
    expect(() => parseEmailListText('subject_id,email\n')).toThrow(BulkParseFailure);
  });
});

describe('parseEmailListWorkbook', () => {
  const emailWorkbook = (rows: unknown[][]) => {
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows), 'Emails');
    const bytes: ArrayBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    return new File([bytes], 'emails.xlsx');
  };

  it('should parse the first sheet and auto-detect subject ID and email columns', async () => {
    const result = await parseEmailListWorkbook(
      emailWorkbook([
        ['subject_id', 'email'],
        ['alice', 'alice@x.com'],
        ['bob', 'bob@x.com']
      ])
    );
    expect(result.headers).toEqual(['subject_id', 'email']);
    expect(result.mapping).toMatchObject({ email: 'email', subject_id: 'subjectId' });
    expect(result.rows).toEqual([
      { email: 'alice@x.com', subject_id: 'alice' },
      { email: 'bob@x.com', subject_id: 'bob' }
    ]);
  });

  it('should reject an empty workbook', async () => {
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, utils.aoa_to_sheet([]), 'Empty');
    const bytes: ArrayBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new File([bytes], 'empty.xlsx');
    const errors = await failureOf(() => parseEmailListWorkbook(file));
    expect(errors[0]?.message).toContain('No columns');
  });

  it('should reject a corrupt file', async () => {
    vi.mocked(read).mockImplementationOnce(() => {
      throw new Error('corrupt');
    });
    const file = new File([new Uint8Array(10)], 'corrupt.xlsx');
    const errors = await failureOf(() => parseEmailListWorkbook(file));
    expect(errors[0]?.message).toContain('could not be read');
  });

  it('should reject a workbook with no sheets', async () => {
    vi.mocked(read).mockReturnValueOnce({ SheetNames: [], Sheets: {} });
    const file = new File([new Uint8Array(10)], 'no-sheets.xlsx');
    const errors = await failureOf(() => parseEmailListWorkbook(file));
    expect(errors[0]?.message).toContain('no sheets');
  });

  describe('cell values', () => {
    const workbookOf = (rows: unknown[][]) => {
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows), 'Sheet1');
      const bytes: ArrayBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
      return new File([bytes], 'cells.xlsx');
    };

    it('should read a number, a boolean and a padded string as trimmed text', async () => {
      const result = await parseEmailListWorkbook(
        workbookOf([
          ['subject_id', 'count', 'flag'],
          ['  alice  ', 42, true]
        ])
      );
      expect(result.rows[0]).toEqual({ count: '42', flag: 'true', subject_id: 'alice' });
    });

    it('should read a date cell as a basic ISO date, so an ISO check can be applied to it', async () => {
      // A date is why `cellDates` is set: a locale-formatted "3/14/1982" would fail that check.
      const result = await parseEmailListWorkbook(
        workbookOf([
          ['subject_id', 'dob'],
          ['alice', new Date('1982-03-14T00:00:00.000Z')]
        ])
      );
      expect(result.rows[0]?.dob).toBe('1982-03-14');
    });

    it('should read a cell of an unsupported type as empty, rather than as the word for it', async () => {
      vi.mocked(read).mockReturnValueOnce({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: utils.aoa_to_sheet([['subject_id', 'odd']]) }
      });
      vi.spyOn(utils, 'sheet_to_json').mockReturnValueOnce([{ odd: { nested: true }, subject_id: 'alice' }]);
      const result = await parseEmailListWorkbook(new File([new Uint8Array(10)], 'odd.xlsx'));
      expect(result.rows[0]).toEqual({ odd: '', subject_id: 'alice' });
    });
  });
});

import { generateSubjectHash } from '@opendatacapture/subject-utils';
import { describe, expect, it } from 'vitest';

import {
  buildResultRows,
  BulkParseFailure,
  isWorkbookFile,
  parseDelimitedText,
  resolveSubjectIds,
  resultCsvFilename,
  toResultCsv,
  toResultTsv
} from '../bulk-assignments';

const resolve = (input: string, maxSubjects = 500) => resolveSubjectIds(parseDelimitedText(input), { maxSubjects });

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

  it('should ignore columns that map to nothing, including email', () => {
    const result = parseDelimitedText('subjectId,email,notes\nsubject-1,a@b.co,hello');
    expect(result.mapping).toEqual({ subjectId: 'subjectId' });
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

  it('should number errors by the row of the user file, counting the header as row 1', async () => {
    const errors = await failureOf(() =>
      resolve('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2000-01-01,M\nAnne,Roy,2000-01-02,X')
    );
    expect(errors[0]).toMatchObject({ row: 3 });
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
    const errors = await failureOf(() =>
      resolve('firstName,lastName,dateOfBirth,sex\nJean,Tremblay,2000-01-01,M\nJean,Tremblay,2000-01-01,M')
    );
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
    const [row] = buildResultRows({ assignments: [assignment], instrumentTitleById: {}, subjectIdDisplayLength: 9 });
    expect(row?.expiresAt).toBe('2027-09-10');
  });

  it('should name the instrument rather than exporting its id, which reads as noise', () => {
    const [row] = buildResultRows({
      assignments: [assignment],
      instrumentTitleById: { __V2__0c5b9177a7df14b3: 'Happiness Questionnaire' },
      subjectIdDisplayLength: 9
    });
    expect(row?.instrument).toBe('Happiness Questionnaire');
  });

  it('should fall back to the id when the instrument is not among those offered', () => {
    const [row] = buildResultRows({ assignments: [assignment], instrumentTitleById: {}, subjectIdDisplayLength: 9 });
    expect(row?.instrument).toBe('__V2__0c5b9177a7df14b3');
  });

  it('should echo back the uploaded row, so a hashed identifier can be traced to a person', () => {
    const [row] = buildResultRows({
      assignments: [assignment],
      instrumentTitleById: {},
      sourceRowBySubjectId: { 'subject-1': { dateOfBirth: '1982-03-14', firstName: 'Marie', lastName: 'Belanger' } },
      subjectIdDisplayLength: 9
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
      instrumentTitleById: {},
      subjectIdDisplayLength: 9
    });
    expect(rows).toHaveLength(2);
  });
});

describe('buildResultRows subject columns', () => {
  it('should carry the truncated identifier the app displays beside the full key', () => {
    const [row] = buildResultRows({
      assignments: [
        {
          expiresAt: '2027-09-10T23:59:59.999Z',
          instrumentId: 'i1',
          subjectId: 'a'.repeat(64),
          url: 'http://x/a1'
        }
      ],
      instrumentTitleById: {},
      subjectIdDisplayLength: 9
    });
    expect(row?.subject).toBe('aaaaaaaaa');
  });

  it('should strip the group scope from a custom identifier, as the app does', () => {
    const [row] = buildResultRows({
      assignments: [
        { expiresAt: '2027-01-01', instrumentId: 'i1', subjectId: 'Depression_Clinic$ex_111', url: 'http://x/a1' }
      ],
      instrumentTitleById: {},
      subjectIdDisplayLength: 9
    });
    expect(row?.subject).toBe('ex_111');
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
      sourceRowBySubjectId: { Depression_Clinic$ex_111: { firstName: 'Marie', lastName: 'Belanger' } },
      subjectIdDisplayLength: 9
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
      instrumentTitleById: {},
      subjectIdDisplayLength: 9
    });
    expect(Object.keys(rows[0]!)).not.toContain('subjectId');
    expect(rows[0]?.subject).toBe('aaaaaaaaa');
  });
});

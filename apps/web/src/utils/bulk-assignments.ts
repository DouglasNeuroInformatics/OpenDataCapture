import { toBasicISOString, toLocalISOString } from '@douglasneuroinformatics/libjs';
import { $Sex } from '@opendatacapture/schemas/subject';
import { generateSubjectHash } from '@opendatacapture/subject-utils';
import Papa from 'papaparse';

/**
 * Parsing, subject-id resolution and export for the bulk remote assignment wizard.
 *
 * Everything here is pure and browser-only by design. Personal information supplied by the user is
 * resolved to a subject id in this module and never leaves it: only the derived ids are handed to
 * the caller, so nothing upstream can put a name or a date of birth into a request, a log line or a
 * toast.
 */

/** Refused before reading, so a mistaken multi-hundred-megabyte selection cannot lock up the tab. */
const MAX_FILE_SIZE_BYTES = 5_000_000;

const MAX_PREVIEW_ROWS = 4;

type CanonicalField = 'dateOfBirth' | 'firstName' | 'lastName' | 'sex' | 'subjectId';

/**
 * Header aliases, English and French. Compared after normalization, so only meaningful spelling
 * differences need to appear here - case, accents, punctuation and spacing are handled by
 * `normalizeHeader`.
 */
const FIELD_ALIASES: { [K in CanonicalField]: string[] } = {
  dateOfBirth: ['dateofbirth', 'dob', 'birthdate', 'datedenaissance', 'ddn', 'naissance'],
  firstName: ['firstname', 'givenname', 'prenom', 'first'],
  lastName: ['lastname', 'surname', 'familyname', 'nom', 'nomdefamille', 'last'],
  sex: ['sex', 'gender', 'sexe', 'genre'],
  subjectId: ['subjectid', 'id', 'identifier', 'subject', 'participantid', 'identifiant', 'idsujet', 'sujet']
};

const SEX_ALIASES: { [key: string]: 'FEMALE' | 'MALE' } = {
  f: 'FEMALE',
  female: 'FEMALE',
  feminin: 'FEMALE',
  femme: 'FEMALE',
  homme: 'MALE',
  m: 'MALE',
  male: 'MALE',
  masculin: 'MALE'
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type BulkParseError = {
  message: string;
  /** 1-based index of the offending row as the user sees it in their file, when it is row-specific. */
  row?: number;
};

type BulkSourceMode = 'ID' | 'PII';

type BulkParseResult = {
  headers: string[];
  /** Canonical field for each column, by header. Absent means the column is ignored. */
  mapping: Partial<{ [key: string]: CanonicalField }>;
  mode: BulkSourceMode;
  /** The first few rows, for the mapping preview. Raw values - never send these anywhere. */
  preview: { [key: string]: string }[];
  rows: { [key: string]: string }[];
};

/**
 * Strip everything that is not a letter or digit, and fold accents, so `Date de naissance`,
 * `DATE_DE_NAISSANCE` and `Date De Naissance` are one header.
 */
function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function isEmptyRow(row: { [key: string]: string }): boolean {
  return Object.values(row).every((value) => value.trim() === '');
}

/**
 * Map each header onto a canonical field. A canonical field may be claimed only once - two columns
 * both looking like a last name is ambiguous, and guessing which one is meant would silently assign
 * the wrong people.
 */
function buildMapping(headers: string[]): {
  errors: BulkParseError[];
  mapping: Partial<{ [key: string]: CanonicalField }>;
} {
  const mapping: Partial<{ [key: string]: CanonicalField }> = {};
  const claimed = new Map<CanonicalField, string>();
  const errors: BulkParseError[] = [];

  for (const header of headers) {
    const normalized = normalizeHeader(header);
    const field = (Object.keys(FIELD_ALIASES) as CanonicalField[]).find((candidate) =>
      FIELD_ALIASES[candidate].includes(normalized)
    );
    if (!field) {
      continue;
    }
    const existing = claimed.get(field);
    if (existing) {
      errors.push({ message: `Columns "${existing}" and "${header}" both map to ${field}` });
      continue;
    }
    claimed.set(field, header);
    mapping[header] = field;
  }
  return { errors, mapping };
}

function detectMode(mapping: Partial<{ [key: string]: CanonicalField }>): BulkSourceMode | null {
  const fields = new Set(Object.values(mapping));
  if (fields.has('subjectId')) {
    return 'ID';
  }
  if (fields.has('firstName') && fields.has('lastName') && fields.has('dateOfBirth') && fields.has('sex')) {
    return 'PII';
  }
  return null;
}

function columnFor(mapping: Partial<{ [key: string]: CanonicalField }>, field: CanonicalField): string {
  return Object.keys(mapping).find((header) => mapping[header] === field)!;
}

/** Shared by every source once it has been reduced to headers and string rows. */
function buildResult(headers: string[], rows: { [key: string]: string }[]): BulkParseResult {
  if (headers.length === 0) {
    throw new BulkParseFailure([{ message: 'No columns were found. The first row must contain column headers.' }]);
  }
  const { errors, mapping } = buildMapping(headers);
  const mode = detectMode(mapping);
  if (!mode) {
    errors.push({
      message:
        'Could not find a subject ID column, or a complete set of first name, last name, date of birth and sex columns.'
    });
  }
  if (errors.length > 0) {
    throw new BulkParseFailure(errors);
  }
  const populated = rows.filter((row) => !isEmptyRow(row));
  if (populated.length === 0) {
    throw new BulkParseFailure([{ message: 'The file contains headers but no data rows.' }]);
  }
  return {
    headers,
    mapping,
    mode: mode!,
    preview: populated.slice(0, MAX_PREVIEW_ROWS),
    rows: populated
  };
}

/**
 * Name the export by local time rather than UTC, so it matches the clock of whoever downloaded it,
 * and without colons, which a filename cannot carry on Windows.
 */
function resultCsvFilename(now: Date): string {
  return `bulk-remote-assignments-${toLocalISOString(now).slice(0, 19).replaceAll(':', '-')}.csv`;
}

/** The fields of a created assignment that the results export and clipboard table are built from. */
type ResultAssignment = {
  expiresAt: Date | string;
  instrumentId: string;
  subjectId: string;
  url: string;
};

/**
 * Build the rows the user takes away.
 *
 * When the batch came from a file or a paste, each original row is echoed back with the link added,
 * because a resolved identifier is a hash: without their own columns beside it the user cannot tell
 * which link belongs to which person. One row is emitted per subject per instrument.
 *
 * Note this means the exported file contains whatever personal information the user supplied, next
 * to live assignment links. It is generated in the browser and never uploaded, but it is a sensitive
 * artifact once saved.
 */
function buildResultRows({
  assignments,
  instrumentTitleById,
  sourceRowBySubjectId
}: {
  assignments: ResultAssignment[];
  instrumentTitleById: { [instrumentId: string]: string };
  sourceRowBySubjectId?: { [subjectId: string]: { [column: string]: string } };
}): { [key: string]: string }[] {
  return assignments.map((assignment) => ({
    ...sourceRowBySubjectId?.[assignment.subjectId],
    expiresAt: toBasicISOString(new Date(assignment.expiresAt)),
    instrument: instrumentTitleById[assignment.instrumentId] ?? assignment.instrumentId,
    subjectId: assignment.subjectId,
    url: assignment.url
  }));
}

/**
 * A two-column table for the clipboard. Tab separated so it pastes into a spreadsheet as columns
 * rather than as one run of text.
 */
function toLinkTable(assignments: ResultAssignment[]): string {
  return ['subjectId\turl', ...assignments.map(({ subjectId, url }) => `${subjectId}\t${url}`)].join('\n');
}

/** Thrown by every parse and resolve entry point, carrying user-displayable, row-numbered errors. */
export class BulkParseFailure extends Error {
  readonly errors: BulkParseError[];

  constructor(errors: BulkParseError[]) {
    super(errors.map(({ message }) => message).join('; '));
    this.name = 'BulkParseFailure';
    this.errors = errors;
  }
}

/**
 * Parse delimited text. The delimiter is detected by Papa Parse, which covers the comma, tab and
 * semicolon separators a user is likely to paste, and so also covers `.csv` and `.tsv` content.
 */
export function parseDelimitedText(input: string): BulkParseResult {
  const parsed = Papa.parse<{ [key: string]: string }>(input.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    transform: (value) => value.trim(),
    transformHeader: (header) => header.trim()
  });
  // `UndetectableDelimiter` is a warning, not a failure: single-column input - a lone subject ID
  // column, the most common case here - gives Papa Parse nothing to detect, and it correctly
  // defaults to a comma. `FieldMismatch` is likewise tolerated; a ragged row is caught later by the
  // per-field validation, with a row number attached.
  const fatal = parsed.errors.filter(({ code, type }) => type !== 'FieldMismatch' && code !== 'UndetectableDelimiter');
  if (fatal.length > 0) {
    throw new BulkParseFailure(fatal.map((error) => ({ message: error.message, row: error.row })));
  }
  return buildResult(parsed.meta.fields ?? [], parsed.data);
}

/**
 * Parse a spreadsheet. `xlsx` is imported here rather than at module scope so its cost is paid only
 * by a user who actually selects a workbook.
 */
export async function parseWorkbook(file: File): Promise<BulkParseResult> {
  assertFileSize(file);
  const { read, utils } = await import('xlsx');
  const workbook = read(await file.arrayBuffer(), { cellDates: true, type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new BulkParseFailure([{ message: 'The workbook contains no sheets.' }]);
  }
  // `raw: false` renders every cell as its displayed text, which keeps dates in the sheet's own
  // formatting rather than as Excel serial numbers.
  const rows = utils.sheet_to_json<{ [key: string]: string }>(workbook.Sheets[sheetName]!, {
    defval: '',
    raw: false
  });
  const headers = Object.keys(rows[0] ?? {}).map((header) => header.trim());
  return buildResult(
    headers,
    rows.map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim(), String(value ?? '').trim()]))
    )
  );
}

export function assertFileSize(file: File): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new BulkParseFailure([
      { message: `File is larger than the ${Math.round(MAX_FILE_SIZE_BYTES / 1_000_000)} MB limit.` }
    ]);
  }
}

/** Only these extensions are offered; anything else is rejected before it is read. */
export const ACCEPTED_FILE_EXTENSIONS = ['.csv', '.tsv', '.xlsx'] as const;

export function isWorkbookFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.xlsx');
}

/**
 * Reduce parsed rows to the subject ids the API will be given.
 *
 * In PII mode the id is derived here with `generateSubjectHash`, the same function the rest of the
 * platform uses - the algorithm is never reimplemented, because its output is the subject's primary
 * key. The personal information itself stops at this function.
 */
export async function resolveSubjectIds(
  result: BulkParseResult,
  { maxSubjects }: { maxSubjects: number }
): Promise<string[]> {
  const errors: BulkParseError[] = [];
  const ids: string[] = [];

  for (const [index, row] of result.rows.entries()) {
    // The header occupies row 1, so the first data row is row 2 in the user's file.
    const rowNumber = index + 2;
    if (result.mode === 'ID') {
      const value = row[columnFor(result.mapping, 'subjectId')]?.trim();
      if (!value) {
        errors.push({ message: 'Missing subject ID', row: rowNumber });
        continue;
      }
      ids.push(value);
      continue;
    }

    const firstName = row[columnFor(result.mapping, 'firstName')]?.trim();
    const lastName = row[columnFor(result.mapping, 'lastName')]?.trim();
    const rawDateOfBirth = row[columnFor(result.mapping, 'dateOfBirth')]?.trim();
    const rawSex = row[columnFor(result.mapping, 'sex')]?.trim();

    if (!firstName || !lastName || !rawDateOfBirth || !rawSex) {
      errors.push({ message: 'Missing first name, last name, date of birth or sex', row: rowNumber });
      continue;
    }
    // Anything other than an unambiguous ISO date is refused rather than guessed: 03/04/2001 is a
    // different person in Montreal than in Boston, and a wrong guess silently hashes to a subject
    // who is not the one in the file.
    if (!ISO_DATE.test(rawDateOfBirth)) {
      errors.push({ message: 'Date of birth must be written as YYYY-MM-DD', row: rowNumber });
      continue;
    }
    const dateOfBirth = new Date(`${rawDateOfBirth}T00:00:00.000Z`);
    if (Number.isNaN(dateOfBirth.getTime())) {
      errors.push({ message: 'Date of birth is not a real date', row: rowNumber });
      continue;
    }
    const sex = SEX_ALIASES[normalizeHeader(rawSex)];
    if (!sex || !$Sex.safeParse(sex).success) {
      errors.push({ message: 'Sex must be male or female', row: rowNumber });
      continue;
    }
    ids.push(await generateSubjectHash({ dateOfBirth, firstName, lastName, sex }));
  }

  if (errors.length > 0) {
    throw new BulkParseFailure(errors);
  }

  // Reported by resolved id rather than by row, because two different rows of personal information
  // that hash to the same subject are a duplicate too.
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }
  if (duplicates.size > 0) {
    throw new BulkParseFailure([
      { message: `The same subject appears more than once (${duplicates.size} duplicated)` }
    ]);
  }
  if (ids.length > maxSubjects) {
    throw new BulkParseFailure([{ message: `A single operation is limited to ${maxSubjects} subjects` }]);
  }
  return ids;
}

/**
 * Serialize results for download. `escapeFormulae` is what stops a value beginning with `=`, `+`,
 * `-` or `@` from being executed as a formula when the file is opened in a spreadsheet.
 */
export function toResultCsv(rows: { [key: string]: string }[]): string {
  return Papa.unparse(rows, { escapeFormulae: true });
}

export { buildResultRows, resultCsvFilename, toLinkTable };

export type { BulkParseError, BulkParseResult, BulkSourceMode, ResultAssignment };

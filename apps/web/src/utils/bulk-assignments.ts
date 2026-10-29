import { toBasicISOString, toLocalISOString } from '@douglasneuroinformatics/libjs';
import type { BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';
import { $Sex } from '@opendatacapture/schemas/subject';
import { encodeScopedSubjectId, generateSubjectHash, removeSubjectIdScope } from '@opendatacapture/subject-utils';
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

type CanonicalField = 'dateOfBirth' | 'email' | 'firstName' | 'lastName' | 'sex' | 'subjectId';

/**
 * Header aliases, English and French. Compared after normalization, so only meaningful spelling
 * differences need to appear here - case, accents, punctuation and spacing are handled by
 * `normalizeHeader`.
 */
const FIELD_ALIASES: { [K in CanonicalField]: string[] } = {
  dateOfBirth: ['dateofbirth', 'dob', 'birthdate', 'datedenaissance', 'ddn', 'naissance'],
  email: ['email', 'emailaddress', 'courriel', 'correo', 'mail'],
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

const GENERATED_ID = /^[0-9a-f]{64}$/i;

/**
 * Turn an identifier as a person would write it into the one the record is stored under.
 *
 * A custom identifier is stored scoped to its group (`Group$id`) but is shown, exported and spoken
 * about without that prefix, so a user pasting what they see would otherwise never match. A digest
 * is never scoped, and an already-scoped value is left alone.
 */
function toStoredSubjectId(value: string, groupName: string | undefined): string {
  if (!groupName || value.includes('$') || GENERATED_ID.test(value)) {
    return value;
  }
  return encodeScopedSubjectId(value, { groupName });
}

/**
 * The outcome of looking an identifier up among a group's subjects. Ambiguous is kept apart from
 * unknown because the two are different mistakes: one identifier is too short to name anybody in
 * particular, the other names somebody this group does not have.
 */
type SubjectIdMatch = { id: string; kind: 'MATCH' } | { kind: 'AMBIGUOUS' } | { kind: 'UNKNOWN' };

/**
 * Match a resolved subject ID against known subjects, handling truncated identifiers.
 *
 * The datahub shows identifiers truncated to `subjectIdDisplayLength` characters. A user who copies
 * one of those and pastes it into a bulk file would never match the full stored ID. When exactly one
 * known subject starts with the supplied value, that is unambiguous and the full ID is returned.
 */
function matchKnownSubjectId(value: string, knownSubjectIds: string[]): SubjectIdMatch {
  const exact = knownSubjectIds.find((id) => id === value);
  if (exact) {
    return { id: exact, kind: 'MATCH' };
  }
  const unscopedValue = removeSubjectIdScope(value);
  const prefixMatches = knownSubjectIds.filter(
    (id) => removeSubjectIdScope(id).startsWith(unscopedValue) || id.startsWith(value)
  );
  if (prefixMatches.length === 1) {
    return { id: prefixMatches[0]!, kind: 'MATCH' };
  }
  return prefixMatches.length > 1 ? { kind: 'AMBIGUOUS' } : { kind: 'UNKNOWN' };
}

type BulkParseError = {
  /** Optional detail lines rendered beneath the message, such as the rows a refusal names. */
  items?: string[];
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
    const field = (Object.keys(FIELD_ALIASES) as CanonicalField[]).find((candidate) => {
      return FIELD_ALIASES[candidate].includes(normalized);
    });
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
    // Subject leads the row: it is what a reader scans down, and it sat buried between the
    // uploaded columns. Scope removed so it reads the way the app talks about a subject, but not
    // truncated, since this is the value pasted back in to assign again. A spread separates the
    // sorted groups, so this stays first.
    subject: removeSubjectIdScope(assignment.subjectId),
    ...sourceRowBySubjectId?.[assignment.subjectId],
    expiresAt: toBasicISOString(new Date(assignment.expiresAt)),
    instrument: instrumentTitleById[assignment.instrumentId] ?? assignment.instrumentId,
    url: assignment.url
  }));
}

/**
 * The same rows as the download, tab separated so they paste into a spreadsheet as columns. Built
 * from `buildResultRows` like the file is, so the two cannot drift apart.
 */
function toResultTsv(rows: { [key: string]: string }[]): string {
  return Papa.unparse(rows, { delimiter: '\t', escapeFormulae: true });
}

/** Thrown by every parse and resolve entry point, carrying user-displayable, row-numbered errors. */
class BulkParseFailure extends Error {
  readonly errors: BulkParseError[];

  constructor(errors: BulkParseError[]) {
    super(errors.map(({ message }) => message).join('; '));
    this.name = 'BulkParseFailure';
    this.errors = errors;
  }
}

/** The header row and the populated data rows of a source, before anything is read from them. */
type SourceTable = {
  headers: string[];
  rows: { [key: string]: string }[];
};

/**
 * Read delimited text into headers and rows. The delimiter is detected by Papa Parse, which covers
 * the comma, tab and semicolon separators a user is likely to paste, and so also covers `.csv` and
 * `.tsv` content.
 */
function readDelimitedText(input: string): SourceTable {
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
    // What survives the filter is a `Quotes` error, which Papa Parse always reports with a row. That
    // row counts the header line from zero, so one is added to number it as the user's file does.
    throw new BulkParseFailure(fatal.map((error) => ({ message: error.message, row: error.row! + 1 })));
  }
  // Papa Parse always reports the header row as `meta.fields` in header mode; its types mark the field
  // optional only because it is absent when `header` is false.
  return { headers: parsed.meta.fields!, rows: parsed.data.filter((row) => !isEmptyRow(row)) };
}

/** Parse delimited text as a batch of subjects, which requires a usable set of columns. */
function parseDelimitedText(input: string): BulkParseResult {
  const { headers, rows } = readDelimitedText(input);
  return buildResult(headers, rows);
}

/** A spreadsheet cell as the rest of this module wants it: trimmed text, or nothing. */
function cellToString(value: unknown): string {
  if (value instanceof Date) {
    return toBasicISOString(value);
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  return '';
}

/**
 * Read the first sheet of a spreadsheet into headers and rows. `xlsx` is imported here rather than
 * at module scope so its cost is paid only by a user who actually selects a workbook.
 */
async function readWorkbook(file: File): Promise<SourceTable> {
  assertFileSize(file);
  const { read, utils } = await import('xlsx');
  let workbook: ReturnType<typeof read>;
  try {
    workbook = read(await file.arrayBuffer(), { cellDates: true, type: 'array' });
  } catch {
    throw new BulkParseFailure([
      { message: 'The file could not be read as a workbook. It may be corrupt or unsupported.' }
    ]);
  }
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new BulkParseFailure([{ message: 'The workbook contains no sheets.' }]);
  }
  // `raw: true` preserves typed values so Date cells arrive as JS Dates rather than locale-
  // formatted strings like "3/14/1982", which would fail ISO validation in `resolveSubjectIds`.
  const rows = utils.sheet_to_json<{ [key: string]: unknown }>(workbook.Sheets[sheetName]!, {
    defval: '',
    raw: true
  });
  return {
    headers: Object.keys(rows[0] ?? {}).map((header) => header.trim()),
    rows: rows.map((row) => {
      return Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim(), cellToString(value)]));
    })
  };
}

/** Parse a spreadsheet as a batch of subjects, which requires a usable set of columns. */
async function parseWorkbook(file: File): Promise<BulkParseResult> {
  const { headers, rows } = await readWorkbook(file);
  return buildResult(headers, rows);
}

function assertFileSize(file: File): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new BulkParseFailure([
      { message: `File is larger than the ${Math.round(MAX_FILE_SIZE_BYTES / 1_000_000)} MB limit.` }
    ]);
  }
}

/** Only these extensions are offered; anything else is rejected before it is read. */
const ACCEPTED_FILE_EXTENSIONS = ['.csv', '.tsv', '.xlsx'] as const;

function isWorkbookFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.xlsx');
}

/**
 * A row that resolved to an identifier, with the row of the user's file it came from, so a caller
 * can report or drop it without holding the personal information beside it.
 */
type ResolvedRow = {
  id: string;
  /** 1-based, as the user's file numbers it: the header is row 1. */
  rowNumber: number;
};

/**
 * What the mapped columns resolved to. The rows the group cannot place are reported rather than
 * thrown, so the caller can offer to skip them; everything a file cannot recover from - a missing
 * field, an unreadable date, a duplicate - is still a refusal.
 */
type SubjectIdResolution = {
  /** Rows whose identifier is a prefix of more than one subject in the group. */
  ambiguousRows: number[];
  /** The rows that named a subject this group has, in file order. */
  matched: ResolvedRow[];
  /** Rows naming a subject this group does not have. */
  unknownRows: number[];
};

/**
 * Reduce parsed rows to the subject ids the API will be given.
 *
 * In PII mode the id is derived here with `generateSubjectHash`, the same function the rest of the
 * platform uses - the algorithm is never reimplemented, because its output is the subject's primary
 * key. The personal information itself stops at this function: a row is reported by its number and
 * never by anything the user wrote in it.
 */
async function resolveSubjectIds(
  result: BulkParseResult,
  { groupName, knownSubjectIds, maxSubjects }: { groupName?: string; knownSubjectIds?: string[]; maxSubjects: number }
): Promise<SubjectIdResolution> {
  const errors: BulkParseError[] = [];
  const resolved: ResolvedRow[] = [];
  const ambiguousRows: number[] = [];
  const unknownRows: number[] = [];

  for (const [index, row] of result.rows.entries()) {
    // The header occupies row 1, so the first data row is row 2 in the user's file.
    const rowNumber = index + 2;
    if (result.mode === 'ID') {
      const value = row[columnFor(result.mapping, 'subjectId')]?.trim();
      if (!value) {
        errors.push({ message: 'Missing subject ID', row: rowNumber });
        continue;
      }
      const stored = toStoredSubjectId(value, groupName);
      if (!knownSubjectIds) {
        resolved.push({ id: stored, rowNumber });
        continue;
      }
      const match = matchKnownSubjectId(stored, knownSubjectIds);
      if (match.kind === 'MATCH') {
        resolved.push({ id: match.id, rowNumber });
      } else if (match.kind === 'AMBIGUOUS') {
        ambiguousRows.push(rowNumber);
      } else {
        unknownRows.push(rowNumber);
      }
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
    if (Number.isNaN(dateOfBirth.getTime()) || dateOfBirth.toISOString().slice(0, 10) !== rawDateOfBirth) {
      errors.push({ message: 'Date of birth is not a real date', row: rowNumber });
      continue;
    }
    const sex = SEX_ALIASES[normalizeHeader(rawSex)];
    if (!sex || !$Sex.safeParse(sex).success) {
      errors.push({ message: 'Sex must be male or female', row: rowNumber });
      continue;
    }
    const id = await generateSubjectHash({ dateOfBirth, firstName, lastName, sex });
    if (knownSubjectIds && !knownSubjectIds.includes(id)) {
      unknownRows.push(rowNumber);
    } else {
      resolved.push({ id, rowNumber });
    }
  }

  if (errors.length > 0) {
    throw new BulkParseFailure(errors);
  }

  // Reported by resolved id rather than by row, because two different rows of personal information
  // that hash to the same subject are a duplicate too.
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { id } of resolved) {
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
  if (resolved.length > maxSubjects) {
    throw new BulkParseFailure([{ message: `A single operation is limited to ${maxSubjects} subjects` }]);
  }
  return { ambiguousRows, matched: resolved, unknownRows };
}

/**
 * The subjects a refusal says this group cannot assign to, across every issue naming some. Shared
 * so the count the review step offers to skip and the ids the submit then drops cannot disagree.
 */
function unavailableSubjectIds(failure: BulkAssignmentFailure | null): string[] {
  return (failure?.issues ?? []).flatMap((issue) => (issue.kind === 'SUBJECT_UNAVAILABLE' ? issue.subjectIds : []));
}

/** Hand a generated CSV to the browser as a download, and release the object URL behind it. */
function downloadCsv(csv: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const anchor = document.createElement('a');
  anchor.download = filename;
  anchor.href = url;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Serialize results for download. `escapeFormulae` is what stops a value beginning with `=`, `+`,
 * `-` or `@` from being executed as a formula when the file is opened in a spreadsheet.
 */
function toResultCsv(rows: { [key: string]: string }[]): string {
  return Papa.unparse(rows, { escapeFormulae: true });
}

/** A subject's email address, by the id the address belongs to. */
type SubjectEmails = { [subjectId: string]: string };

type EmailListResolution = {
  emails: SubjectEmails;
  /** Subjects the file names, and has a row for, but leaves without an address. */
  missingEmail: string[];
  /** Subject IDs the file names that match no subject in the group, as the file spells them. */
  unmatched: string[];
};

/**
 * Match each row of a parsed email list to a known subject and extract the email address. A row
 * that yields no address is counted rather than rejected, under the reason it yielded none - the
 * file may name a subject the group does not have, or name one and leave its address blank - so the
 * caller can tell the two apart. A row with no subject ID at all is attributable to nobody and is
 * passed over in silence.
 */
function resolveEmailList(
  rows: { [key: string]: string }[],
  mapping: Partial<{ [key: string]: CanonicalField }>,
  { groupName, knownSubjectIds }: { groupName?: string; knownSubjectIds: string[] }
): EmailListResolution {
  const subjectIdHeader = Object.keys(mapping).find((header) => mapping[header] === 'subjectId');
  const emailHeader = Object.keys(mapping).find((header) => mapping[header] === 'email');
  if (!subjectIdHeader || !emailHeader) {
    return { emails: {}, missingEmail: [], unmatched: [] };
  }
  const emails: SubjectEmails = {};
  // Sets, so a subject listed on two rows is reported once: these name subjects, not rows.
  const missingEmail = new Set<string>();
  const unmatched = new Set<string>();
  for (const row of rows) {
    const rawId = row[subjectIdHeader]?.trim();
    if (!rawId) {
      continue;
    }
    const stored = toStoredSubjectId(rawId, groupName);
    const match = matchKnownSubjectId(stored, knownSubjectIds);
    // An ambiguous identifier names nobody in particular, which is as unusable here as one naming
    // nobody at all, and the file spelled both the same way.
    if (match.kind !== 'MATCH') {
      unmatched.add(rawId);
      continue;
    }
    const email = row[emailHeader]?.trim();
    if (!email) {
      missingEmail.add(match.id);
      continue;
    }
    emails[match.id] = email;
  }
  return {
    emails,
    // A subject given an address on one row and left blank on another has an address, so it is not
    // missing one, whichever order the rows came in.
    missingEmail: [...missingEmail].filter((subjectId) => !emails[subjectId]),
    unmatched: [...unmatched]
  };
}

type EmailListParseResult = {
  headers: string[];
  mapping: Partial<{ [key: string]: CanonicalField }>;
  rows: { [key: string]: string }[];
};

/**
 * Parse a source for the email-list upload. Unlike the subject batch, this does not require a
 * subject ID column or a complete PII set - any column layout is accepted and column detection is
 * best-effort, because the user maps the columns afterwards.
 */
function toEmailListResult({ headers, rows }: SourceTable): EmailListParseResult {
  if (headers.length === 0) {
    throw new BulkParseFailure([{ message: 'No columns were found. The first row must contain column headers.' }]);
  }
  const populated = rows.filter((row) => !isEmptyRow(row));
  if (populated.length === 0) {
    throw new BulkParseFailure([{ message: 'The file contains headers but no data rows.' }]);
  }
  const { mapping } = buildMapping(headers);
  return { headers, mapping, rows: populated };
}

function parseEmailListText(input: string): EmailListParseResult {
  return toEmailListResult(readDelimitedText(input));
}

async function parseEmailListWorkbook(file: File): Promise<EmailListParseResult> {
  return toEmailListResult(await readWorkbook(file));
}

export {
  ACCEPTED_FILE_EXTENSIONS,
  assertFileSize,
  buildResultRows,
  BulkParseFailure,
  detectMode,
  downloadCsv,
  isWorkbookFile,
  parseDelimitedText,
  parseEmailListText,
  parseEmailListWorkbook,
  parseWorkbook,
  resolveEmailList,
  resolveSubjectIds,
  resultCsvFilename,
  toResultCsv,
  toResultTsv,
  unavailableSubjectIds
};

export type {
  BulkParseError,
  BulkParseResult,
  BulkSourceMode,
  CanonicalField,
  EmailListParseResult,
  EmailListResolution,
  SubjectEmails,
  SubjectIdResolution
};

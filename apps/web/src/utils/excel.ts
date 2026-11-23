import { utils, writeFileXLSX } from 'xlsx';

/** Maximum data rows an `.xlsx` worksheet can hold alongside its header row (`1,048,576 - 1`). */
const EXCEL_MAX_DATA_ROWS = 1_048_575;

export { EXCEL_MAX_DATA_ROWS };

export class ExcelRowLimitExceededError extends Error {
  constructor(maxRows = EXCEL_MAX_DATA_ROWS) {
    super(`Cannot write more than ${maxRows} rows to an Excel worksheet`);
    this.name = 'ExcelRowLimitExceededError';
  }
}

export function downloadSubjectTableExcel(filename: string, records: { [key: string]: any }[], name: string) {
  if (records.length > EXCEL_MAX_DATA_ROWS) {
    throw new ExcelRowLimitExceededError();
  }
  const sanitizedName =
    name
      .replace(/[\\/?*[\]:]/g, '_') // Replace invalid chars
      .slice(0, 31) // Max 31 chars
      .replace(/^'|'$/g, '') // Remove leading/trailing apostrophes
      .trim() || 'Subject'; // Fallback if empty
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.json_to_sheet(records), sanitizedName);
  writeFileXLSX(workbook, filename);
}

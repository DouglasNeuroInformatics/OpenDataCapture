import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import { utils, writeFileXLSX } from 'xlsx';

export function downloadExcel(filename: string, recordsExport: InstrumentRecordsExport) {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.json_to_sheet(recordsExport), 'ULTRA_LONG');
  writeFileXLSX(workbook, filename);
}

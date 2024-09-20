import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import { utils, writeFileXLSX } from 'xlsx';
// import type { WorkBook } from 'xlsx';

// function processSlice(
//   workbook: WorkBook,
//   state: IncompleteAppState,
//   name: T,
//   options?: {
//     order?: Extract<keyof IncompleteAppState[T], string>[];
//     title?: string;
//   }
// ) {
//   const slice = state[name];
//   if (!slice) {
//     return;
//   }

//   const title = options?.title ?? _.capitalize(name);
//   const keys = getOrderedKeys(slice, options?.order);
//   const labels = APP_STATE_LABELS[name];

//   const row: { [key: string]: Primitive } = {};
//   for (const key of keys) {
//     const item = slice[key as keyof typeof slice] as FormFieldValue;
//     const label = labels[key as keyof typeof labels];
//     if (isPrimitive(item) && typeof label === 'string') {
//       row[label] = item;
//     } else if (typeof label === 'object') {
//       processArray({
//         labels: label,
//         name: `${title} (${label._arrayLabel})`,
//         value: item as ArrayFormFieldValue,
//         workbook
//       });
//     }
//   }
//   return utils.book_append_sheet(workbook, utils.json_to_sheet([row]), title);
// }

export function downloadExcel(filename: string, recordsExport: InstrumentRecordsExport) {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.json_to_sheet(recordsExport), 'ULTRA_LONG');
  writeFileXLSX(workbook, filename);
}

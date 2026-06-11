/** @public */
export const FILE_TYPES = Object.freeze({
  binary: Object.freeze(['application/octet-stream'] as const),
  documents: Object.freeze([
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/html',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf'
  ] as const),
  images: Object.freeze(['image/png', 'image/jpeg', 'image/tiff', 'image/gif', 'image/svg+xml', 'image/bmp'] as const),
  spreadsheets: Object.freeze([
    'text/csv',
    'text/tsv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet'
  ] as const),
  structured: Object.freeze(['application/json', 'application/xml'] as const)
} as const);

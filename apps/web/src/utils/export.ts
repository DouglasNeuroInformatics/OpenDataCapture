import type {
  InstrumentRecordsExport,
  InstrumentRecordsExportFrame
} from '@opendatacapture/schemas/instrument-records';
import { Unpackr } from 'msgpackr/unpack';
import { unparse } from 'papaparse';

import { EXCEL_MAX_DATA_ROWS, ExcelRowLimitExceededError } from './excel';

const FRAME_LENGTH_HEADER_BYTES = 4;

type FrameAccumulator = {
  bufferedBytes: number;
  chunks: Uint8Array[];
  expectedFrameLength: null | number;
  unpackr: Unpackr;
};

type IncompleteUnpackError = Error & {
  incomplete: true;
};

function isIncompleteUnpackError(error: unknown): error is IncompleteUnpackError {
  return Reflect.get(Object(error), 'incomplete') === true;
}

function isExportFrame(value: unknown): value is InstrumentRecordsExportFrame {
  if (typeof value !== 'object' || value === null || !('done' in value)) {
    return false;
  }
  if (value.done === true) {
    return (
      'rowCount' in value &&
      typeof value.rowCount === 'number' &&
      Number.isInteger(value.rowCount) &&
      value.rowCount >= 0
    );
  }
  if (value.done === false) {
    return 'rows' in value && Array.isArray(value.rows);
  }
  return false;
}

function takeBytes(chunks: Uint8Array[], length: number): Uint8Array {
  const combined = new Uint8Array(length);
  let written = 0;
  let consumedChunks = 0;

  for (const chunk of chunks) {
    const remaining = length - written;
    if (chunk.byteLength <= remaining) {
      combined.set(chunk, written);
      written += chunk.byteLength;
      consumedChunks += 1;
    } else {
      combined.set(chunk.subarray(0, remaining), written);
      chunks[consumedChunks] = chunk.subarray(remaining);
      break;
    }
  }

  if (consumedChunks > 0) {
    chunks.splice(0, consumedChunks);
  }

  return combined;
}

function decodeFramePayload(unpackr: Unpackr, payload: Uint8Array): InstrumentRecordsExportFrame[] {
  let values: unknown[];
  try {
    values = unpackr.unpackMultiple(payload);
  } catch (error) {
    if (isIncompleteUnpackError(error)) {
      throw new IncompleteExportStreamError('Export frame contained incomplete MessagePack bytes');
    }
    throw error;
  }

  const frames: InstrumentRecordsExportFrame[] = [];
  for (const value of values) {
    if (!isExportFrame(value)) {
      throw new IncompleteExportStreamError('Export stream contained a malformed frame');
    }
    frames.push(value);
  }
  return frames;
}

function drainCompleteFrames(state: FrameAccumulator): InstrumentRecordsExportFrame[] {
  const decoded: InstrumentRecordsExportFrame[] = [];

  while (true) {
    if (state.expectedFrameLength === null) {
      if (state.bufferedBytes < FRAME_LENGTH_HEADER_BYTES) {
        break;
      }
      const header = takeBytes(state.chunks, FRAME_LENGTH_HEADER_BYTES);
      state.bufferedBytes -= FRAME_LENGTH_HEADER_BYTES;
      state.expectedFrameLength = new DataView(header.buffer, header.byteOffset, FRAME_LENGTH_HEADER_BYTES).getUint32(
        0,
        false
      );
      if (state.expectedFrameLength === 0) {
        throw new IncompleteExportStreamError('Export stream contained an empty frame');
      }
    }

    if (state.bufferedBytes < state.expectedFrameLength) {
      break;
    }

    const payload = takeBytes(state.chunks, state.expectedFrameLength);
    state.bufferedBytes -= state.expectedFrameLength;
    state.expectedFrameLength = null;
    decoded.push(...decodeFramePayload(state.unpackr, payload));
  }

  return decoded;
}

export class IncompleteExportStreamError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'IncompleteExportStreamError';
  }
}

export function downloadBlob(filename: string, blob: Blob): void {
  const anchor = document.createElement('a');
  document.body.appendChild(anchor);
  const url = URL.createObjectURL(blob);
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  anchor.remove();
}

/**
 * Unpacks uint32BE length-prefixed sequential MessagePack frames from
 * `POST /v1/instrument-records/export`, decoding each frame once after all of its bytes arrive and
 * verifying that the terminal `{ done: true, rowCount }` frame matches the total rows yielded.
 */
export async function* readExportStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<InstrumentRecordsExport, void, undefined> {
  const reader = stream.getReader();
  const state: FrameAccumulator = {
    bufferedBytes: 0,
    chunks: [],
    expectedFrameLength: null,
    unpackr: new Unpackr({ structures: [] })
  };
  let emittedRows = 0;
  let terminalRowCount: null | number = null;
  let streamDone = false;

  try {
    while (true) {
      let chunk: ReadableStreamReadResult<Uint8Array>;
      try {
        chunk = await reader.read();
      } catch (error) {
        throw new IncompleteExportStreamError('Export stream failed while reading response body', { cause: error });
      }
      if (chunk.done) {
        streamDone = true;
        break;
      }
      const { value } = chunk;
      if (value.byteLength === 0) {
        continue;
      }

      state.chunks.push(value);
      state.bufferedBytes += value.byteLength;

      for (const frame of drainCompleteFrames(state)) {
        if (terminalRowCount !== null) {
          throw new IncompleteExportStreamError('Unexpected frame after export stream completion');
        }
        if (frame.done) {
          terminalRowCount = frame.rowCount;
        } else {
          emittedRows += frame.rows.length;
          yield frame.rows;
        }
      }
    }

    if (state.expectedFrameLength !== null || state.bufferedBytes > 0) {
      throw new IncompleteExportStreamError('Export stream ended with trailing incomplete frame bytes');
    }
    if (terminalRowCount === null) {
      throw new IncompleteExportStreamError('Export stream ended before terminal frame');
    }
    if (emittedRows !== terminalRowCount) {
      throw new IncompleteExportStreamError(
        `Export stream row count mismatch: expected ${terminalRowCount}, received ${emittedRows}`
      );
    }
  } finally {
    if (!streamDone) {
      try {
        await reader.cancel();
      } catch {
        // An already-errored ReadableStream rejects cancel() with its stored error; ignore it so
        // releaseLock() still runs and the original error from the loop is not masked.
      }
    }
    reader.releaseLock();
  }
}

export async function buildCsvExportBlob(
  stream: ReadableStream<Uint8Array>
): Promise<{ blob: Blob; rowCount: number }> {
  const parts: string[] = [];
  let columns: string[] | undefined;
  let rowCount = 0;

  for await (const rows of readExportStream(stream)) {
    const [firstRow] = rows;
    if (!firstRow) {
      continue;
    }
    if (!columns) {
      columns = Object.keys(firstRow);
      parts.push(unparse(rows, { columns, header: true }));
    } else {
      parts.push('\r\n', unparse(rows, { columns, header: false }));
    }
    rowCount += rows.length;
  }

  return {
    blob: new Blob(parts, { type: 'text/csv;charset=utf-8' }),
    rowCount
  };
}

export async function buildJsonExportBlob(
  stream: ReadableStream<Uint8Array>
): Promise<{ blob: Blob; rowCount: number }> {
  const parts: string[] = [];
  let rowCount = 0;

  for await (const rows of readExportStream(stream)) {
    if (rows.length === 0) {
      continue;
    }
    parts.push(parts.length === 0 ? '[\n' : ',\n', JSON.stringify(rows, null, 2).slice(2, -2));
    rowCount += rows.length;
  }

  if (parts.length === 0) {
    parts.push('[]');
  } else {
    parts.push('\n]');
  }

  return {
    blob: new Blob(parts, { type: 'application/json;charset=utf-8' }),
    rowCount
  };
}

export async function collectExcelExportRows(
  stream: ReadableStream<Uint8Array>,
  maxRows = EXCEL_MAX_DATA_ROWS
): Promise<InstrumentRecordsExport> {
  const collected: InstrumentRecordsExport = [];
  for await (const rows of readExportStream(stream)) {
    if (collected.length + rows.length > maxRows) {
      throw new ExcelRowLimitExceededError(maxRows);
    }
    for (const row of rows) {
      collected.push(row);
    }
  }
  return collected;
}

import type {
  InstrumentRecordsExport,
  InstrumentRecordsExportFrame
} from '@opendatacapture/schemas/instrument-records';
import { Packr } from 'msgpackr/pack';
import { Unpackr } from 'msgpackr/unpack';
import { unparse } from 'papaparse';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ExcelRowLimitExceededError } from '../excel';
import {
  buildCsvExportBlob,
  buildJsonExportBlob,
  collectExcelExportRows,
  downloadBlob,
  IncompleteExportStreamError,
  readExportStream
} from '../export';

const exportRow = (subjectId: string, value: number): InstrumentRecordsExport[number] => ({
  groupId: 'group-1',
  instrumentEdition: 1,
  instrumentName: 'HAPPINESS_QUESTIONNAIRE',
  measure: 'score',
  seriesId: null,
  seriesName: null,
  sessionDate: '2026-01-01',
  sessionId: 'session-1',
  sessionType: 'IN_PERSON',
  subjectAge: 30,
  subjectId,
  subjectSex: 'MALE',
  timestamp: '2026-01-01T00:00:00.000Z',
  username: 'jdoe',
  value
});

const packLengthPrefixedFrame = (packr: Packr, frame: InstrumentRecordsExportFrame): Uint8Array => {
  const payload = new Uint8Array(packr.pack(frame));
  const framed = new Uint8Array(4 + payload.byteLength);
  new DataView(framed.buffer).setUint32(0, payload.byteLength, false);
  framed.set(payload, 4);
  return framed;
};

const packFrames = (frames: InstrumentRecordsExportFrame[]): Uint8Array => {
  const packr = new Packr({ sequential: true, useRecords: true });
  const chunks = frames.map((frame) => packLengthPrefixedFrame(packr, frame));
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return combined;
};

const streamChunks = (chunks: Uint8Array[], onCancel?: () => void): ReadableStream<Uint8Array> => {
  let index = 0;
  return new ReadableStream<Uint8Array>({
    cancel() {
      onCancel?.();
    },
    pull(controller) {
      if (index >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(chunks[index]!);
      index += 1;
    }
  });
};

describe('downloadBlob', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should trigger an anchor download for the blob and immediately revoke its object URL', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-export');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const blob = new Blob(['hello'], { type: 'text/plain' });

    downloadBlob('export.txt', blob);

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-export');
    expect(document.querySelector('a[download="export.txt"]')).toBeNull();
  });
});

describe('readExportStream', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should reassemble frames split across single-byte and empty chunks while sharing record structures', async () => {
    const rowA = exportRow('alice', 10);
    const rowB = exportRow('bob', 20);
    const encoded = packFrames([
      { done: false, rows: [rowA] },
      { done: false, rows: [rowB] },
      { done: true, rowCount: 2 }
    ]);
    const chunks: Uint8Array[] = [new Uint8Array(0)];
    for (const byte of encoded) {
      chunks.push(new Uint8Array([byte]));
    }

    const pages: InstrumentRecordsExport[] = [];
    for await (const page of readExportStream(streamChunks(chunks))) {
      pages.push(page);
    }

    expect(pages).toStrictEqual([[rowA], [rowB]]);
  });

  it('should decode each complete frame once rather than re-decoding partial bytes on every network chunk', async () => {
    const unpackSpy = vi.spyOn(Unpackr.prototype, 'unpackMultiple');
    const encoded = packFrames([
      { done: false, rows: [exportRow('alice', 10), exportRow('bob', 20)] },
      { done: true, rowCount: 2 }
    ]);
    const chunks: Uint8Array[] = [];
    for (let offset = 0; offset < encoded.byteLength; offset += 2) {
      chunks.push(encoded.slice(offset, offset + 2));
    }

    const pages: InstrumentRecordsExport[] = [];
    for await (const page of readExportStream(streamChunks(chunks))) {
      pages.push(page);
    }

    expect(chunks.length).toBeGreaterThan(20);
    expect(unpackSpy).toHaveBeenCalledTimes(2);
    expect(pages).toStrictEqual([[exportRow('alice', 10), exportRow('bob', 20)]]);
  });

  it('should decode a complete frame and buffer a trailing partial frame arriving in the same chunk', async () => {
    const packr = new Packr({ sequential: true, useRecords: true });
    const first = packLengthPrefixedFrame(packr, { done: false, rows: [exportRow('alice', 10)] });
    const second = packLengthPrefixedFrame(packr, { done: true, rowCount: 1 });
    const splitPoint = Math.floor(second.byteLength / 2);

    const chunk1 = new Uint8Array(first.byteLength + splitPoint);
    chunk1.set(first, 0);
    chunk1.set(second.slice(0, splitPoint), first.byteLength);
    const chunk2 = second.slice(splitPoint);

    const pages: InstrumentRecordsExport[] = [];
    for await (const page of readExportStream(streamChunks([chunk1, chunk2]))) {
      pages.push(page);
    }

    expect(pages).toStrictEqual([[exportRow('alice', 10)]]);
  });

  it('should handle a header completed across chunks while queued chunks remain behind it', async () => {
    const encoded = packFrames([{ done: true, rowCount: 0 }]);
    const chunks = [encoded.slice(0, 2), encoded.slice(2, 4), encoded.slice(4)];

    const pages: InstrumentRecordsExport[] = [];
    for await (const page of readExportStream(streamChunks(chunks))) {
      pages.push(page);
    }

    expect(pages).toStrictEqual([]);
  });

  it('should reject a stream truncated mid-header with IncompleteExportStreamError', async () => {
    const truncatedHeader = new Uint8Array([0, 0]);

    const consume = async () => {
      for await (const _ of readExportStream(streamChunks([truncatedHeader]))) {
        // consume
      }
    };

    await expect(consume()).rejects.toBeInstanceOf(IncompleteExportStreamError);
  });

  it('should reject a stream truncated mid-frame payload with IncompleteExportStreamError', async () => {
    const encoded = packFrames([{ done: false, rows: [exportRow('alice', 10)] }]);
    const truncated = encoded.slice(0, Math.floor(encoded.byteLength / 2));

    const consume = async () => {
      for await (const _ of readExportStream(streamChunks([truncated]))) {
        // consume
      }
    };

    await expect(consume()).rejects.toBeInstanceOf(IncompleteExportStreamError);
  });

  it('should reject a zero-length frame header with IncompleteExportStreamError', async () => {
    const zeroLengthFrame = new Uint8Array([0, 0, 0, 0]);

    const consume = async () => {
      for await (const _ of readExportStream(streamChunks([zeroLengthFrame]))) {
        // consume
      }
    };

    await expect(consume()).rejects.toThrow('Export stream contained an empty frame');
  });

  it('should reject a frame whose payload contains truncated MessagePack bytes', async () => {
    // Frame header declares 1 byte, and 0x92 is a 2-element fixarray missing both elements.
    const corruptFrame = new Uint8Array([0, 0, 0, 1, 0x92]);

    const consume = async () => {
      for await (const _ of readExportStream(streamChunks([corruptFrame]))) {
        // consume
      }
    };

    await expect(consume()).rejects.toThrow('Export frame contained incomplete MessagePack bytes');
  });

  it('should reject a stream that closes without a terminal frame, so a failed page is never saved as complete', async () => {
    const encoded = packFrames([{ done: false, rows: [exportRow('alice', 10)] }]);

    const consume = async () => {
      for await (const _ of readExportStream(streamChunks([encoded]))) {
        // consume
      }
    };

    await expect(consume()).rejects.toThrow('Export stream ended before terminal frame');
  });

  it('should reject a stream carrying another frame after the terminal frame', async () => {
    const encoded = packFrames([
      { done: true, rowCount: 0 },
      { done: false, rows: [exportRow('alice', 10)] }
    ]);

    const consume = async () => {
      for await (const _ of readExportStream(streamChunks([encoded]))) {
        // consume
      }
    };

    await expect(consume()).rejects.toThrow('Unexpected frame after export stream completion');
  });

  it('should reject a stream whose terminal row count disagrees with the yielded rows', async () => {
    const encoded = packFrames([
      { done: false, rows: [exportRow('alice', 10)] },
      { done: true, rowCount: 2 }
    ]);

    const consume = async () => {
      for await (const _ of readExportStream(streamChunks([encoded]))) {
        // consume
      }
    };

    await expect(consume()).rejects.toThrow('Export stream row count mismatch: expected 2, received 1');
  });

  it('should rethrow non-incomplete MessagePack decoding errors', async () => {
    // 0xd4 (fixext 1) with unregistered extension type 0x7a fails immediately rather than waiting for more bytes.
    const invalidMsgpack = new Uint8Array([0, 0, 0, 3, 0xd4, 0x7a, 0x00]);

    const consume = async () => {
      for await (const _ of readExportStream(streamChunks([invalidMsgpack]))) {
        // consume
      }
    };

    await expect(consume()).rejects.toThrow('Unknown extension');
  });

  it('should wrap mid-stream read rejections in IncompleteExportStreamError and release the reader lock cleanly', async () => {
    const packr = new Packr({ sequential: true, useRecords: true });
    const firstFrame = packLengthPrefixedFrame(packr, { done: false, rows: [exportRow('alice', 10)] });
    let emittedFirst = false;

    const erroredStream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (!emittedFirst) {
          emittedFirst = true;
          controller.enqueue(firstFrame);
          return;
        }
        controller.error(new TypeError('network socket aborted'));
      }
    });

    const pages: InstrumentRecordsExport[] = [];
    const consume = async () => {
      for await (const page of readExportStream(erroredStream)) {
        pages.push(page);
      }
    };

    await expect(consume()).rejects.toBeInstanceOf(IncompleteExportStreamError);
    expect(pages).toStrictEqual([[exportRow('alice', 10)]]);
    expect(erroredStream.locked).toBe(false);
  });

  it.each([
    ['primitive', 'not-an-object'],
    ['null', null],
    ['missing done', {}],
    ['non-boolean done', { done: 'yes' }],
    ['missing terminal rowCount', { done: true }],
    ['non-numeric terminal rowCount', { done: true, rowCount: '2' }],
    ['fractional terminal rowCount', { done: true, rowCount: 1.5 }],
    ['negative terminal rowCount', { done: true, rowCount: -1 }],
    ['missing rows', { done: false }],
    ['non-array rows', { done: false, rows: 'bad' }]
  ])('should reject a malformed frame envelope (%s) with IncompleteExportStreamError', async (_label, badFrame) => {
    const packr = new Packr({ sequential: true, useRecords: true });
    const payload = new Uint8Array(packr.pack(badFrame));
    const framed = new Uint8Array(4 + payload.byteLength);
    new DataView(framed.buffer).setUint32(0, payload.byteLength, false);
    framed.set(payload, 4);

    const consume = async () => {
      for await (const _ of readExportStream(streamChunks([framed]))) {
        // consume
      }
    };

    await expect(consume()).rejects.toThrow('Export stream contained a malformed frame');
  });
});

describe('buildCsvExportBlob', () => {
  it('should format multiple pages into a single CSV matching unparse on the combined rows', async () => {
    const rowA = exportRow('alice', 10);
    const rowB = exportRow('bob', 20);
    const encoded = packFrames([
      { done: false, rows: [] },
      { done: false, rows: [rowA] },
      { done: false, rows: [rowB] },
      { done: true, rowCount: 2 }
    ]);

    const { blob, rowCount } = await buildCsvExportBlob(streamChunks([encoded]));

    expect(rowCount).toBe(2);
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(await blob.text()).toBe(unparse([rowA, rowB]));
  });
});

describe('buildJsonExportBlob', () => {
  it('should format multiple pages into pretty-printed JSON matching JSON.stringify on the combined rows', async () => {
    const rowA = exportRow('alice', 10);
    const rowB = exportRow('bob', 20);
    const encoded = packFrames([
      { done: false, rows: [] },
      { done: false, rows: [rowA] },
      { done: false, rows: [rowB] },
      { done: true, rowCount: 2 }
    ]);

    const { blob, rowCount } = await buildJsonExportBlob(streamChunks([encoded]));

    expect(rowCount).toBe(2);
    expect(blob.type).toBe('application/json;charset=utf-8');
    expect(await blob.text()).toBe(JSON.stringify([rowA, rowB], null, 2));
  });

  it('should return an empty JSON array when zero rows were exported', async () => {
    const encoded = packFrames([{ done: true, rowCount: 0 }]);

    const { blob, rowCount } = await buildJsonExportBlob(streamChunks([encoded]));

    expect(rowCount).toBe(0);
    expect(await blob.text()).toBe('[]');
  });
});

describe('collectExcelExportRows', () => {
  it('should collect rows across all pages within the default worksheet limit', async () => {
    const rowA = exportRow('alice', 10);
    const rowB = exportRow('bob', 20);
    const encoded = packFrames([
      { done: false, rows: [rowA] },
      { done: false, rows: [rowB] },
      { done: true, rowCount: 2 }
    ]);

    await expect(collectExcelExportRows(streamChunks([encoded]))).resolves.toStrictEqual([rowA, rowB]);
  });

  it('should cancel the stream and throw ExcelRowLimitExceededError as soon as collected rows exceed maxRows', async () => {
    const onCancel = vi.fn();
    const packr = new Packr({ sequential: true, useRecords: true });
    const page1 = packLengthPrefixedFrame(packr, {
      done: false,
      rows: [exportRow('alice', 10), exportRow('bob', 20)]
    });
    const page2 = packLengthPrefixedFrame(packr, { done: true, rowCount: 2 });

    await expect(collectExcelExportRows(streamChunks([page1, page2], onCancel), 1)).rejects.toBeInstanceOf(
      ExcelRowLimitExceededError
    );
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

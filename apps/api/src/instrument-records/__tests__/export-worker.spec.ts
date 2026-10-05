import { EventEmitter } from 'events';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { InitData, ParentMessage, RecordType } from '../thread-types';

class MockParentPort extends EventEmitter {
  postMessage = vi.fn();

  send(message: ParentMessage) {
    this.emit('message', message);
  }
}

const RUNTIME_INTERNAL_SPECIFIER = '#runtime/v1/@opendatacapture/runtime-internal/index.js';

const initData: InitData = [{ edition: 2, id: 'instrument-1', name: 'Happiness Questionnaire' }];

const createRecord = (overrides: Partial<RecordType> = {}): RecordType => ({
  computedMeasures: { score: 85 },
  date: '2025-01-02',
  groupId: 'group-1',
  id: 'record-1',
  instrumentId: 'instrument-1',
  session: {
    date: '2025-01-01',
    id: 'session-1',
    type: 'IN_PERSON',
    user: { username: 'jane.doe' }
  },
  subject: {
    age: 30,
    groupIds: ['group-1'],
    id: 'group-1$subject-1',
    sex: 'FEMALE'
  },
  ...overrides
});

const expectedRow = {
  groupId: 'group-1',
  instrumentEdition: 2,
  instrumentName: 'Happiness Questionnaire',
  measure: 'score',
  sessionDate: '2025-01-01',
  sessionId: 'session-1',
  sessionType: 'IN_PERSON',
  subjectAge: 30,
  subjectId: 'subject-1',
  subjectSex: 'FEMALE',
  timestamp: '2025-01-02',
  username: 'jane.doe',
  value: 85
};

async function loadWorker(options: { parentPort?: MockParentPort | null } = {}) {
  const parentPort = options.parentPort === undefined ? new MockParentPort() : options.parentPort;
  vi.doMock('worker_threads', () => ({ parentPort }));
  await import('../export-worker.js');
  return parentPort;
}

async function loadInitializedWorker() {
  const parentPort = (await loadWorker())!;
  parentPort.send({ data: initData, type: 'INIT' });
  parentPort.postMessage.mockClear();
  return parentPort;
}

describe('export-worker', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock(RUNTIME_INTERNAL_SPECIFIER);
  });

  it('should load without a parent port, so importing it outside a worker thread is harmless', async () => {
    await expect(loadWorker({ parentPort: null })).resolves.toBeNull();
  });

  it('should fall back to the workspace runtime package when the subpath import cannot be resolved', async () => {
    // Under vitest both specifiers resolve to runtime/v1/dist, so one mock serves both imports: failing only the
    // first attempt is what routes the worker through its fallback.
    let attempts = 0;
    vi.doMock(RUNTIME_INTERNAL_SPECIFIER, () => {
      if (attempts++ === 0) {
        throw new Error('Cannot resolve subpath import');
      }
      return { removeSubjectIdScope: (id: string) => `fallback:${id}` };
    });
    const parentPort = (await loadWorker())!;
    parentPort.send({ data: initData, type: 'INIT' });
    parentPort.send({ data: [createRecord()], type: 'BEGIN_CHUNK_PROCESSING' });
    expect(parentPort.postMessage).toHaveBeenLastCalledWith({
      data: [{ ...expectedRow, subjectId: 'fallback:group-1$subject-1' }],
      success: true
    });
  });

  it('should acknowledge the init message, so the parent knows the worker is ready', async () => {
    const parentPort = (await loadWorker())!;
    parentPort.send({ data: initData, type: 'INIT' });
    expect(parentPort.postMessage).toHaveBeenCalledWith({ success: true });
  });

  it('should throw on an unknown message type, so a protocol mismatch is not silently ignored', async () => {
    const parentPort = (await loadWorker())!;
    expect(() => parentPort.emit('message', { type: 'UNKNOWN' })).toThrow('Unexpected message type: UNKNOWN');
  });

  it('should refuse to process a chunk before init, since instrument metadata is required', async () => {
    const parentPort = (await loadWorker())!;
    expect(() => parentPort.send({ data: [createRecord()], type: 'BEGIN_CHUNK_PROCESSING' })).toThrow(
      'Expected init data to be defined'
    );
  });

  it('should emit one row per scalar measure with the subject scope removed', async () => {
    const parentPort = await loadInitializedWorker();
    parentPort.send({ data: [createRecord()], type: 'BEGIN_CHUNK_PROCESSING' });
    expect(parentPort.postMessage).toHaveBeenCalledWith({ data: [expectedRow], success: true });
  });

  it('should default the group and username, so records without them still export', async () => {
    const parentPort = await loadInitializedWorker();
    const record = createRecord({ session: { ...createRecord().session, user: null } });
    Reflect.set(record, 'groupId', null);
    parentPort.send({ data: [record], type: 'BEGIN_CHUNK_PROCESSING' });
    expect(parentPort.postMessage).toHaveBeenCalledWith({
      data: [{ ...expectedRow, groupId: 'root', username: 'N/A' }],
      success: true
    });
  });

  it('should emit no rows for a record without computed measures', async () => {
    const parentPort = await loadInitializedWorker();
    parentPort.send({ data: [createRecord({ computedMeasures: null })], type: 'BEGIN_CHUNK_PROCESSING' });
    expect(parentPort.postMessage).toHaveBeenCalledWith({ data: [], success: true });
  });

  it('should skip null, undefined and empty array measures, so absent values produce no rows', async () => {
    const parentPort = await loadInitializedWorker();
    const record = createRecord({ computedMeasures: { empty: [], missing: undefined, none: null } });
    parentPort.send({ data: [record], type: 'BEGIN_CHUNK_PROCESSING' });
    expect(parentPort.postMessage).toHaveBeenCalledWith({ data: [], success: true });
  });

  it('should expand array measures into one row per entry key, prefixed with the measure name', async () => {
    const parentPort = await loadInitializedWorker();
    const record = createRecord({ computedMeasures: { trials: [{ rt: 300 }, { correct: true, rt: 450 }] } });
    parentPort.send({ data: [record], type: 'BEGIN_CHUNK_PROCESSING' });
    expect(parentPort.postMessage).toHaveBeenCalledWith({
      data: [
        { ...expectedRow, measure: 'trials - rt', value: 300 },
        { ...expectedRow, measure: 'trials - correct', value: true },
        { ...expectedRow, measure: 'trials - rt', value: 450 }
      ],
      success: true
    });
  });

  it('should default the group and username for expanded array rows too', async () => {
    const parentPort = await loadInitializedWorker();
    const record = createRecord({
      computedMeasures: { trials: [{ rt: 300 }] },
      session: { ...createRecord().session, user: null }
    });
    Reflect.set(record, 'groupId', null);
    parentPort.send({ data: [record], type: 'BEGIN_CHUNK_PROCESSING' });
    expect(parentPort.postMessage).toHaveBeenCalledWith({
      data: [{ ...expectedRow, groupId: 'root', measure: 'trials - rt', username: 'N/A', value: 300 }],
      success: true
    });
  });

  it('should report a failure for a record whose instrument was not initialized', async () => {
    const parentPort = await loadInitializedWorker();
    parentPort.send({ data: [createRecord({ instrumentId: 'unknown' })], type: 'BEGIN_CHUNK_PROCESSING' });
    expect(parentPort.postMessage).toHaveBeenCalledWith({
      error: 'Instrument not found for ID: unknown',
      success: false
    });
  });

  it('should report an unknown error when processing throws a non-error value', async () => {
    const parentPort = await loadInitializedWorker();
    const record = createRecord();
    Object.defineProperty(record, 'computedMeasures', {
      get() {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- the worker must survive a thrown non-Error
        throw 'not an error';
      }
    });
    parentPort.send({ data: [record], type: 'BEGIN_CHUNK_PROCESSING' });
    expect(parentPort.postMessage).toHaveBeenCalledWith({ error: 'Unknown Error', success: false });
  });
});

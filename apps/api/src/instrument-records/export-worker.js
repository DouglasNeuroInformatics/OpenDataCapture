import { parentPort } from 'worker_threads';

import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

/** @type {typeof import('@opendatacapture/schemas/core').DEFAULT_GROUP_NAME} */
const DEFAULT_GROUP_NAME = 'root';

/**
 * @typedef {Object} SuccessExpand
 * @property {string} measure
 * @property {any} measureValue
 * @property {true} success
 */

/**
 * @typedef {Object} FailureExpand
 * @property {string} message
 * @property {false} success
 */

/** @typedef {SuccessExpand | FailureExpand} ExpandDataType */

/**
 * Flattens nested record array data into a list of expandable data objects.
 * @param {any[]} listEntry - The array of records to expand.
 * @returns {ExpandDataType[]} An array of expanded measure objects.
 * @throws {Error} If the provided listEntry is empty.
 */
function expandData(listEntry) {
  /** @type {SuccessExpand[]} */
  const validRecordArrayList = [];
  if (listEntry.length < 1) {
    throw new Error('Record Array is Empty');
  }
  for (const objectEntry of Object.values(listEntry)) {
    for (const [dataKey, dataValue] of Object.entries(objectEntry)) {
      validRecordArrayList.push({
        measure: dataKey,
        measureValue: dataValue,
        success: true
      });
    }
  }
  return validRecordArrayList;
}

/**
 * Internal cache for instrument metadata.
 * @type {Map<string | undefined, { edition: number, id: string, name: string }>}
 */
let initData;

/**
 * Initializes the worker with instrument metadata.
 * * @param {Array<{id: string, edition: number, name: string}>} data - The initialization payload.
 */
function handleInit(data) {
  initData = new Map(data.map((instrument) => [instrument.id, instrument]));
  parentPort?.postMessage({ success: true });
}

/**
 * Processes a chunk of records and posts results back to the parent thread.
 * @param {import('./thread-types').BeginChunkProcessingData} _data - The collection of records to process.
 * @throws {Error} If initData is not defined.
 */
function handleChunkComplete(_data) {
  if (!initData) {
    throw new Error('Expected init data to be defined');
  }
  const instrumentsMap = initData;

  /**
   * Transforms a single record into an array of exportable rows.
   * @param {import('./thread-types').RecordType} record - The raw instrument record.
   * @returns {import('@opendatacapture/schemas/instrument-records').InstrumentRecordsExport} The processed rows.
   */
  const processRecord = (record) => {
    const instrument = instrumentsMap.get(record.instrumentId);
    if (!instrument) {
      throw new Error(`Instrument not found for ID: ${record.instrumentId}`);
    }

    if (!record.computedMeasures) {
      return [];
    }

    const rows = [];

    for (const [measureKey, measureValue] of Object.entries(record.computedMeasures)) {
      if (measureValue == null) continue;

      if (!Array.isArray(measureValue)) {
        rows.push({
          groupId: record.groupId ?? DEFAULT_GROUP_NAME,
          instrumentEdition: instrument.edition,
          instrumentName: instrument.name,
          measure: measureKey,
          sessionDate: record.session.date,
          sessionId: record.session.id,
          sessionType: record.session.type,
          subjectAge: record.subject.age,
          subjectId: removeSubjectIdScope(record.subject.id),
          subjectSex: record.subject.sex,
          timestamp: record.date,
          username: record.session.user?.username ?? 'N/A',
          value: measureValue
        });
        continue;
      }

      if (measureValue.length < 1) continue;

      const expanded = expandData(measureValue);
      for (const entry of expanded) {
        if (!entry.success) {
          throw new Error(`exportRecords: ${instrument.name}.${measureKey} — ${entry.message}`);
        }
        rows.push({
          groupId: record.groupId ?? DEFAULT_GROUP_NAME,
          instrumentEdition: instrument.edition,
          instrumentName: instrument.name,
          measure: `${measureKey} - ${entry.measure}`,
          sessionDate: record.session.date,
          sessionId: record.session.id,
          sessionType: record.session.type,
          subjectAge: record.subject.age,
          subjectId: removeSubjectIdScope(record.subject.id),
          subjectSex: record.subject.sex,
          timestamp: record.date,
          username: record.session.user?.username ?? 'N/A',
          value: entry.measureValue
        });
      }
    }
    return rows;
  };

  try {
    const results = _data.map(processRecord);
    parentPort?.postMessage({ data: results.flat(), success: true });
  } catch (error) {
    if (error instanceof Error) {
      parentPort?.postMessage({ error: error.message, success: false });
    } else {
      parentPort?.postMessage({ error: 'Unknown Error', success: false });
    }
  }
}

/**
 * Worker Message Router
 * @param {import('./thread-types').ParentMessage} message
 */
parentPort?.on('message', (message) => {
  switch (message.type) {
    case 'BEGIN_CHUNK_PROCESSING':
      return handleChunkComplete(message.data);
    case 'INIT':
      return handleInit(message.data);
    default:
      throw new Error(`Unexpected message type: ${message.type}`);
  }
});

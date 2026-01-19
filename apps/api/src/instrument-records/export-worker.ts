import { parentPort } from 'worker_threads';

import type { FormTypes, InstrumentMeasureValue } from '@opendatacapture/runtime-core';
import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

import type { ChunkCompleteData, InitData, ParentMessage, RecordType } from './thread-types';
import { isArray } from 'lodash-es';

type ExpandDataType =
  | {
      measure: string;
      measureValue: FormTypes.RecordArrayFieldValue | InstrumentMeasureValue;
      success: true;
    }
  | {
      message: string;
      success: false;
    };

function expandData(listEntry: any[]): ExpandDataType[] {
  const validRecordArrayList: ExpandDataType[] = [];
  if (listEntry.length < 1) {
    throw new Error('Record Array is Empty');
  }
  for (const objectEntry of Object.values(listEntry)) {
    for (const [dataKey, dataValue] of Object.entries(
      objectEntry as { [key: string]: FormTypes.RecordArrayFieldValue }
    )) {
      validRecordArrayList.push({
        measure: dataKey,
        measureValue: dataValue,
        success: true
      });
    }
  }
  return validRecordArrayList;
}

let initData: Map<
  string | undefined,
  {
    edition: number;
    id: string;
    name: string;
  }
>;

function handleInit(data: InitData) {
  initData = new Map(data.map((instrument) => [instrument.id, instrument]));

  parentPort?.postMessage({ success: true });
}

function handleChunkComplete(_data: ChunkCompleteData) {
  if (!initData) {
    throw new Error('Expected init data to be defined');
  }
  const instrumentsMap = initData;

  const processRecord = (record: RecordType): InstrumentRecordsExport => {
    const instrument = instrumentsMap.get(record.instrumentId)!;

    if (!record.computedMeasures) return [];

    //const instrument = instrumentsMap.get(record.instrumentId)!;
    const rows: InstrumentRecordsExport = [];

    for (const [measureKey, measureValue] of Object.entries(record.computedMeasures)) {
      if (measureValue == null) continue;

      if (!Array.isArray(measureValue)) {
        rows.push({
          groupId:
            isArray(record.subject.groupIds) && record.subject.groupIds[0]
              ? record.subject.groupIds[0]
              : DEFAULT_GROUP_NAME,
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
          value: measureValue as InstrumentMeasureValue
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
          groupId:
            isArray(record.subject.groupIds) && record.subject.groupIds[0]
              ? record.subject.groupIds[0]
              : DEFAULT_GROUP_NAME,
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
    parentPort?.postMessage({ error: (error as Error).message, success: false });
  }
}

parentPort!.on('message', (message: ParentMessage) => {
  switch (message.type) {
    case 'CHUNK_COMPLETE':
      return handleChunkComplete(message.data);
    case 'INIT':
      return handleInit(message.data);
    default:
      throw new Error(`Unexpected message type: ${(message satisfies never as { [key: string]: any }).type}`);
  }
});

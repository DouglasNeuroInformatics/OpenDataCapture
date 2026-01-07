import { parentPort } from 'worker_threads';

import { yearsPassed } from '@douglasneuroinformatics/libjs';
import type { ScalarInstrument } from '@opendatacapture/runtime-core';
import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import { $RecordArrayFieldValue } from '@opendatacapture/schemas/instrument';
import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';
import { removeSubjectIdScope } from '@opendatacapture/subject-utils';

type RecordType = {
  computedMeasures: null | { [key: string]: unknown };
  date: Date;
  id: string;
  instrumentId: string;
  session: {
    date: Date;
    id: string;
    type: 'IN_PERSON' | 'REMOTE' | 'RETROSPECTIVE';
    user: null | {
      username: string;
    };
  };
  subject: {
    dateOfBirth: Date | null;
    groupIds: string[];
    id: string;
    sex: string;
  };
};

type ExpandDataType =
  | {
      measure: string;
      measureValue: boolean | Date | number | string | undefined;
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
    for (const [dataKey, dataValue] of Object.entries(objectEntry as { [key: string]: any })) {
      const parseResult = $RecordArrayFieldValue.safeParse(dataValue);
      if (!parseResult.success) {
        validRecordArrayList.push({
          message: `Error interpreting value ${dataValue} and record array key ${dataKey}`,
          success: false
        });
      }
      validRecordArrayList.push({
        measure: dataKey,
        measureValue: parseResult.data,
        success: true
      });
    }
  }
  return validRecordArrayList;
}

parentPort?.on(
  'message',
  ({ instruments, records }: { instruments: [string, ScalarInstrument][]; records: RecordType[] }) => {
    const instrumentsMap = new Map(instruments);

    const processRecord = (record: RecordType): InstrumentRecordsExport => {
      if (!record.computedMeasures) return [];

      const instrument = instrumentsMap.get(record.instrumentId)!;
      const rows: InstrumentRecordsExport = [];

      for (const [measureKey, measureValue] of Object.entries(record.computedMeasures)) {
        if (measureValue == null) continue;

        if (!Array.isArray(measureValue)) {
          rows.push({
            groupId: record.subject.groupIds[0] ?? DEFAULT_GROUP_NAME,
            instrumentEdition: instrument.internal.edition,
            instrumentName: instrument.internal.name,
            measure: measureKey,
            sessionDate: record.session.date.toISOString(),
            sessionId: record.session.id,
            sessionType: record.session.type,
            subjectAge: record.subject.dateOfBirth ? yearsPassed(record.subject.dateOfBirth) : null,
            subjectId: removeSubjectIdScope(record.subject.id),
            subjectSex: record.subject.sex,
            timestamp: record.date.toISOString(),
            username: record.session.user?.username ?? 'N/A',
            value: measureValue as string
          });
          continue;
        }

        if (measureValue.length < 1) continue;

        const expanded = expandData(measureValue);
        for (const entry of expanded) {
          if (!entry.success) {
            throw new Error(`exportRecords: ${instrument.internal.name}.${measureKey} — ${entry.message}`);
          }
          rows.push({
            groupId: record.subject.groupIds[0] ?? DEFAULT_GROUP_NAME,
            instrumentEdition: instrument.internal.edition,
            instrumentName: instrument.internal.name,
            measure: `${measureKey} - ${entry.measure}`,
            sessionDate: record.session.date.toISOString(),
            sessionId: record.session.id,
            sessionType: record.session.type,
            subjectAge: record.subject.dateOfBirth ? yearsPassed(record.subject.dateOfBirth) : null,
            subjectId: removeSubjectIdScope(record.subject.id),
            subjectSex: record.subject.sex,
            timestamp: record.date.toISOString(),
            username: record.session.user?.username ?? 'N/A',
            value: entry.measureValue
          });
        }
      }

      return rows;
    };

    try {
      const results = records.map(processRecord);
      parentPort?.postMessage({ data: results.flat(), success: true });
    } catch (error) {
      parentPort?.postMessage({ error: (error as Error).message, success: false });
    }
  }
);

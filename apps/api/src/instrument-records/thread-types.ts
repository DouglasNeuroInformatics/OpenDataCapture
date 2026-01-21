import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';

export type RecordType = {
  computedMeasures: null | { [key: string]: unknown };
  date: string;
  groupId: string;
  id: string;
  instrumentId: string;
  session: {
    date: string;
    id: string;
    type: 'IN_PERSON' | 'REMOTE' | 'RETROSPECTIVE';
    user: null | {
      username: string;
    };
  };
  subject: {
    age: null | number;
    groupIds: string[];
    id: string;
    sex: string;
  };
};

export type InitData = {
  edition: number;
  id: string;
  name: string;
}[];

export type InitMessage = {
  data: InitData;
  type: 'INIT';
};

export type BeginChunkProcessingData = RecordType[];

export type BeginChunkProcessingMessage = {
  data: BeginChunkProcessingData;
  type: 'BEGIN_CHUNK_PROCESSING';
};

export type ParentMessage = BeginChunkProcessingMessage | InitMessage;

export type WorkerMessage = { data: InstrumentRecordsExport; success: true } | { error: string; success: false };

export type InitialMessage = { success: true };

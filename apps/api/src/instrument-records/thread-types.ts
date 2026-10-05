import type { InstrumentRecordsExport } from '@opendatacapture/schemas/instrument-records';

export type RecordType = {
  computedMeasures: null | { [key: string]: unknown };
  date: string;
  /** Null for a record belonging to no group; the pipeline normalises a missing field to null. */
  groupId: null | string;
  id: string;
  instrumentId: string;
  /** Null for a record collected outside any series */
  seriesInstrumentId: null | string;
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

export type InitPayload = {
  instruments: InitData;
  /** Series instrument id to its title, since a series carries no language-independent name */
  seriesNames: { [id: string]: string };
};

export type InitMessage = {
  data: InitPayload;
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

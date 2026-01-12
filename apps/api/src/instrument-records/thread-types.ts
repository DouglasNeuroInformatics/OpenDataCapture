export type RecordType = {
  computedMeasures: null | { [key: string]: unknown };
  date: string;
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
    age: number;
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

export type ChunkCompleteData = RecordType[];

export type ChunkCompleteMessage = {
  data: ChunkCompleteData;
  type: 'CHUNK_COMPLETE';
};

export type ParentMessage = ChunkCompleteMessage | InitMessage;

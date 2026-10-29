import type { AnyUnilingualFileInstrument, FileInstrument, InstrumentKind } from '@opendatacapture/runtime-core';
import type { AxiosProgressEvent } from 'axios';
import type { Promisable } from 'type-fest';

import type { LocalizedText } from '../../types';

type UploadMap = {
  [basename: string]: File[];
};

type UploadState = {
  loadedFiles: number;
  loadedSize: number;
  totalFiles: number;
  totalProgress: number;
  totalSize: number;
};

type Status = 'FAILED' | 'PENDING' | 'READY' | 'SUBMITTED';

export type UploadProgressEvent = Pick<AxiosProgressEvent, 'loaded' | 'progress' | 'total'>;

export type FileInstrumentContentErrors = {
  [basename: string]: LocalizedText[];
};

export type FileInstrumentContentStore = {
  actions: {
    setFiles: (id: string, files: File[]) => void;
    submit: () => Promise<void>;
  };
  errors: FileInstrumentContentErrors;
  readonly props: FileInstrumentContentProps;
  status: Status;
  uploadMap: UploadMap;
  uploadState: null | UploadState;
};

export type FileInstrumentContentSubmitResult = {
  data: FileInstrument.Data;
  kind: Extract<InstrumentKind, 'FILE'>;
  onNext: () => void;
  onProgress: (file: File, event: UploadProgressEvent) => void;
  uploadMap: UploadMap;
};

export type FileInstrumentContentProps = {
  instrument: AnyUnilingualFileInstrument;
  onSubmit: (result: FileInstrumentContentSubmitResult) => Promisable<void>;
};

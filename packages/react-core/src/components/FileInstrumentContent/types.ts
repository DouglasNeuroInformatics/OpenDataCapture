/* eslint-disable @typescript-eslint/no-namespace */

import type {
  AnyUnilingualFileInstrument,
  FileInstrument,
  InstrumentKind,
  Language
} from '@opendatacapture/runtime-core';
import type { AxiosProgressEvent } from 'axios';
import type { Promisable } from 'type-fest';

import type { NavigationBlockerComponent } from '../NavigationBlockerDialog';

export type UploadMap = {
  [basename: string]: File[];
};

export type UploadProgressEvent = Pick<AxiosProgressEvent, 'loaded' | 'progress' | 'total'>;

export namespace FileInstrumentContentStore {
  export type Errors = {
    [basename: string]: {
      [L in Language]: string;
    }[];
  };

  type UploadState = {
    loadedFiles: number;
    loadedSize: number;
    totalFiles: number;
    totalProgress: number;
    totalSize: number;
  };

  type Status = 'FAILED' | 'PENDING' | 'READY' | 'SUBMITTED';

  export type StoreType = {
    actions: {
      setFiles: (id: string, files: File[]) => void;
      submit: () => Promise<void>;
    };
    errors: Errors;
    readonly props: FileInstrumentContentProps;
    status: Status;
    uploadMap: UploadMap;
    uploadState: null | UploadState;
  };
}

export type FileInstrumentContentStore = FileInstrumentContentStore.StoreType;

export type FileInstrumentContentSubmitResult = {
  data: FileInstrument.Data;
  kind: Extract<InstrumentKind, 'FILE'>;
  onNext: () => void;
  onProgress: (file: File, event: UploadProgressEvent) => void;
  uploadMap: UploadMap;
};

export type FileInstrumentContentProps = {
  instrument: AnyUnilingualFileInstrument & { id: string };
  NavigationBlocker?: NavigationBlockerComponent;
  onSubmit: (result: FileInstrumentContentSubmitResult) => Promisable<void>;
  onSuccess?: () => Promisable<void>;
};

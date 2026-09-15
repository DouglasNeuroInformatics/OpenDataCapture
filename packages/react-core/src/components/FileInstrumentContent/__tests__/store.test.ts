import type { FileInstrument } from '@opendatacapture/runtime-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFileInstrumentContentStore } from '../store';

import type { FileInstrumentContentProps } from '../types';

function createProps(
  overrides: Partial<FileInstrumentContentProps> = {},
  fileGroups: FileInstrument.Content['fileGroups'] = [
    { basename: 'document', count: { max: 1, min: 1 }, label: 'Document', type: null }
  ]
): FileInstrumentContentProps {
  return {
    instrument: { content: { fileGroups }, id: 'instrument-id' } as any,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    ...overrides
  };
}

function createFile(name: string, size = 10) {
  return new File([new Uint8Array(size)], name);
}

describe('createFileInstrumentContentStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with one empty upload slot per file group, ready to submit', () => {
    const store = createFileInstrumentContentStore(createProps());
    expect(store.getState().uploadMap).toEqual({ document: [] });
    expect(store.getState().status).toBe('READY');
  });

  it('should record files set for a group', () => {
    const store = createFileInstrumentContentStore(createProps());
    const file = createFile('a.pdf');
    store.getState().actions.setFiles('document', [file]);
    expect(store.getState().uploadMap.document).toEqual([file]);
  });

  it('should record a validation error and refuse to submit when too few files are uploaded', async () => {
    const props = createProps();
    const store = createFileInstrumentContentStore(props);
    await store.getState().actions.submit();
    expect(store.getState().errors.document).toBeTruthy();
    expect(store.getState().status).toBe('READY');
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('should record a validation error when too many files are uploaded', async () => {
    const props = createProps();
    const store = createFileInstrumentContentStore(props);
    store.getState().actions.setFiles('document', [createFile('a.pdf'), createFile('b.pdf')]);
    await store.getState().actions.submit();
    expect(store.getState().errors.document).toBeTruthy();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('should submit successfully, track progress, and end SUBMITTED', async () => {
    const onSubmit = vi.fn(({ onNext, onProgress }: any) => {
      const file = createFile('a.pdf', 100);
      onProgress(file, { loaded: 50, progress: 0.5, total: 100 });
      onNext();
      return Promise.resolve();
    });
    const props = createProps({ onSubmit });
    const store = createFileInstrumentContentStore(props);
    store.getState().actions.setFiles('document', [createFile('a.pdf')]);

    const submission = store.getState().actions.submit();
    await vi.advanceTimersByTimeAsync(300);
    expect(store.getState().uploadState?.loadedFiles).toBe(1);
    await vi.advanceTimersByTimeAsync(500);
    await submission;

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ data: {}, kind: 'FILE', uploadMap: { document: [expect.any(File)] } })
    );
    expect(store.getState().status).toBe('SUBMITTED');
    expect(store.getState().uploadState).toBeNull();
  });

  it('should log the rejection and end FAILED when onSubmit rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const props = createProps({ onSubmit: vi.fn().mockRejectedValue(new Error('upload failed')) });
    const store = createFileInstrumentContentStore(props);
    store.getState().actions.setFiles('document', [createFile('a.pdf')]);

    const submission = store.getState().actions.submit();
    await vi.advanceTimersByTimeAsync(300);
    await submission;

    expect(store.getState().status).toBe('FAILED');
    expect(store.getState().uploadState).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(new Error('upload failed'));
    errorSpy.mockRestore();
  });
});

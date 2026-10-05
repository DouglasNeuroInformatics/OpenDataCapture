import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { FileInstrument } from '@opendatacapture/runtime-core';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import { Dropzone } from '../Dropzone';
import { createFileInstrumentContentStore, FileInstrumentContentStoreContext } from '../store';

import type { FileInstrumentContentProps } from '../types';

const createInstrument = (
  fileGroup: Partial<FileInstrument.FileGroup<'en'>>
): FileInstrumentContentProps['instrument'] => ({
  __runtimeVersion: 1,
  content: {
    fileGroups: [{ basename: 'document', count: { max: 1, min: 1 }, label: 'Document', type: null, ...fileGroup }]
  },
  details: { description: 'A file instrument', license: 'Apache-2.0', title: 'File Instrument' },
  id: 'instrument-id',
  internal: { edition: 1, name: 'FILE_INSTRUMENT' },
  kind: 'FILE',
  language: 'en',
  measures: null,
  tags: [],
  validationSchema: z.object({})
});

const renderDropzone = (fileGroup: Partial<FileInstrument.FileGroup<'en'>> = {}) => {
  const store = createFileInstrumentContentStore({ instrument: createInstrument(fileGroup), onSubmit: vi.fn() });
  render(
    <FileInstrumentContentStoreContext.Provider value={{ store }}>
      <Dropzone index={0} />
    </FileInstrumentContentStoreContext.Provider>
  );
  return store;
};

const selectFiles = async (files: File[]) => {
  await act(async () => {
    fireEvent.change(screen.getByTestId('dropzone').querySelector('input[type="file"]')!, { target: { files } });
    await Promise.resolve();
  });
};

const createFile = (name: string, type = 'application/pdf') => new File(['content'], name, { type });

describe('Dropzone', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should invite an upload while no file is selected', () => {
    renderDropzone();
    expect(screen.getByText('Drag and Drop or Click to Upload')).toBeTruthy();
  });

  it('should state a single required file in the singular', () => {
    renderDropzone();
    expect(screen.getByText('Exactly 1 File Required')).toBeTruthy();
  });

  it('should state an exact count above one in the plural', () => {
    renderDropzone({ count: { max: 2, min: 2 } });
    expect(screen.getByText('Exactly 2 Files Required')).toBeTruthy();
  });

  it('should state the allowed range when the minimum and maximum differ', () => {
    renderDropzone({ count: { max: 3, min: 1 } });
    expect(screen.getByText('Between 1 and 3 Files Allowed')).toBeTruthy();
  });

  it('should label an untyped group as accepting any file type', () => {
    renderDropzone();
    expect(screen.getByText('Any file type')).toBeTruthy();
  });

  it('should label a typed group with its file type', () => {
    renderDropzone({ type: 'application/pdf' });
    expect(screen.getByText('PDF')).toBeTruthy();
  });

  it('should show the name of a selected file and record it in the store', async () => {
    const store = renderDropzone();
    await selectFiles([createFile('report.pdf')]);
    await waitFor(() => {
      expect(screen.getByText('report.pdf')).toBeTruthy();
    });
    expect(screen.getByText('1 file selected')).toBeTruthy();
    expect(store.getState().uploadMap.document?.map((file) => file.name)).toEqual(['report.pdf']);
  });

  it('should truncate the list after two names, so many files do not overflow the dropzone', async () => {
    renderDropzone({ count: { max: 5, min: 1 } });
    await selectFiles([createFile('a.pdf'), createFile('b.pdf'), createFile('c.pdf')]);
    await waitFor(() => {
      expect(screen.getByText('a.pdf, b.pdf, and 1 more files...')).toBeTruthy();
    });
    expect(screen.getByText('3 files selected')).toBeTruthy();
  });

  it('should name a file of the wrong type as rejected', async () => {
    renderDropzone({ type: 'application/pdf' });
    await selectFiles([createFile('notes.txt', 'text/plain')]);
    await waitFor(() => {
      expect(screen.getByText('"notes.txt" was rejected — only PDF files are accepted')).toBeTruthy();
    });
  });

  it('should accept any file for a type without known extensions, rather than rejecting everything', async () => {
    renderDropzone({ type: 'application/octet-stream' });
    await selectFiles([createFile('notes.txt', 'text/plain')]);
    await waitFor(() => {
      expect(screen.getByText('notes.txt')).toBeTruthy();
    });
    expect(screen.queryByText('Unsupported file type')).toBeNull();
  });

  it('should show the validation issues the store recorded for its group', async () => {
    const store = renderDropzone();
    await act(() => store.getState().actions.submit());
    expect(screen.getByText('You uploaded 0 files, but 1 is required')).toBeTruthy();
  });
});

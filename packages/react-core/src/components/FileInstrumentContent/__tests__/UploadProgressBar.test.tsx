import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createFileInstrumentContentStore, FileInstrumentContentStoreContext } from '../store';
import { UploadProgressBar } from '../UploadProgressBar';

import type { FileInstrumentContentProps } from '../types';

function renderWithStore(uploadState: { loadedFiles: number; totalFiles: number; totalProgress: number }) {
  const props: FileInstrumentContentProps = {
    instrument: { content: { fileGroups: [] }, id: 'instrument-id' } as any,
    onSubmit: () => Promise.resolve(undefined)
  };
  const store = createFileInstrumentContentStore(props);
  store.setState({
    uploadState: {
      loadedFiles: uploadState.loadedFiles,
      loadedSize: 0,
      totalFiles: uploadState.totalFiles,
      totalProgress: uploadState.totalProgress,
      totalSize: 0
    }
  });
  return render(
    <FileInstrumentContentStoreContext.Provider value={{ store }}>
      <UploadProgressBar />
    </FileInstrumentContentStoreContext.Provider>
  );
}

describe('UploadProgressBar', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should report how many files of the total have completed', () => {
    renderWithStore({ loadedFiles: 1, totalFiles: 3, totalProgress: 40 });
    expect(screen.getByText('Uploading files... (1/3 complete)')).toBeTruthy();
  });

  it('should render at zero progress without error', () => {
    renderWithStore({ loadedFiles: 0, totalFiles: 1, totalProgress: 0 });
    expect(screen.getByText('Uploading files... (0/1 complete)')).toBeTruthy();
  });
});

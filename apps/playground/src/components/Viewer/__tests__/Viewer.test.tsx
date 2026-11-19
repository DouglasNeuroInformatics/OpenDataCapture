// @vitest-environment happy-dom

import { Suspense } from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { Viewer } from '../Viewer';

const store = vi.hoisted(() => ({
  state: {
    indexFilename: 'index.ts',
    settings: { refreshInterval: 2000 },
    setTranspilerState: () => undefined,
    transpilerState: { status: 'initial' },
    viewer: { key: 0 }
  }
}));

// The server names the editor's own origin, which is what a deployment that points
// PLAYGROUND_PREVIEW_ORIGIN at the editor's host serves.
const config = vi.hoisted(() => Promise.resolve({ previewOrigin: window.location.origin }));

vi.mock('@/preview/config', () => ({ fetchPlaygroundConfig: () => config }));

vi.mock('@/hooks/useFilesRef', () => ({ useFilesRef: () => ({ current: [] }) }));

vi.mock('@/store', () => ({
  useAppStore: <TSelected,>(selector: (state: typeof store.state) => TSelected) => selector(store.state)
}));

describe('Viewer', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
  });

  afterEach(() => {
    cleanup();
  });

  it('should refuse to run the preview when the server names the editor origin, rather than evaluate instruments beside the editor', async () => {
    await act(async () => {
      render(
        <Suspense>
          <Viewer />
        </Suspense>
      );
      await config;
    });
    expect(await screen.findByRole('heading', { name: 'Preview Unavailable' })).toBeDefined();
    expect(screen.queryByTestId('preview-frame')).toBeNull();
  });
});

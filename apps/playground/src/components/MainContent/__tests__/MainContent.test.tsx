import { renderToStaticMarkup } from 'react-dom/server';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { PanelProps } from 'react-resizable-panels';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { MainContent } from '../MainContent';

const Panel = vi.hoisted(() => vi.fn((_props: PanelProps) => null));

vi.mock('@douglasneuroinformatics/libui/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@douglasneuroinformatics/libui/hooks')>()),
  useMediaQuery: () => true
}));

vi.mock('@/components/Editor', () => ({ Editor: () => null }));

vi.mock('@/components/Viewer', () => ({ Viewer: () => null }));

vi.mock('@/components/Resizable', () => ({
  Resizable: { Handle: () => null, Panel, PanelGroup: ({ children }: PanelProps) => children }
}));

describe('MainContent', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
  });

  it('should size the desktop panes as percentages, since react-resizable-panels reads a bare number as pixels', () => {
    renderToStaticMarkup(<MainContent />);
    expect(Panel.mock.calls.map(([props]) => props)).toMatchObject([
      { defaultSize: '66%', id: 'editor-pane', minSize: '25%' },
      { defaultSize: '34%', id: 'preview-pane', minSize: '25%' }
    ]);
  });
});

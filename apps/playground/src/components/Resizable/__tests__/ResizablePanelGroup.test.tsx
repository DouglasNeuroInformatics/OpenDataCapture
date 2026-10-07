import { renderToStaticMarkup } from 'react-dom/server';

import { Panel } from 'react-resizable-panels';
import type { Orientation } from 'react-resizable-panels';
import { describe, expect, it } from 'vitest';

import { ResizablePanelGroup } from '../ResizablePanelGroup';

const renderGroup = (orientation: Orientation) => {
  const markup = renderToStaticMarkup(
    <ResizablePanelGroup className="rounded-lg" orientation={orientation}>
      <Panel />
    </ResizablePanelGroup>
  );
  return /<div[^>]*data-group[^>]*>/.exec(markup)![0];
};

describe('ResizablePanelGroup', () => {
  it('should stack the panels of a vertical group in a column, which no class of its own does any more', () => {
    expect(renderGroup('vertical')).toContain('flex-direction:column');
  });

  it('should lay the panels of a horizontal group out in a row', () => {
    expect(renderGroup('horizontal')).toContain('flex-direction:row');
  });

  it('should keep the caller class name alongside its own', () => {
    expect(renderGroup('horizontal')).toContain('class="flex h-full w-full rounded-lg"');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';

import { Panel } from 'react-resizable-panels';
import type { Orientation } from 'react-resizable-panels';
import { describe, expect, it } from 'vitest';

import { ResizableHandle } from '../ResizableHandle';
import { ResizablePanelGroup } from '../ResizablePanelGroup';

const renderSeparator = (orientation: Orientation) => {
  const markup = renderToStaticMarkup(
    <ResizablePanelGroup orientation={orientation}>
      <Panel />
      <ResizableHandle className="mr-12" />
      <Panel />
    </ResizablePanelGroup>
  );
  const tag = /<div[^>]*role="separator"[^>]*>/.exec(markup)![0];
  const attribute = (name: string) => new RegExp(`${name}="([^"]*)"`).exec(tag)![1]!;
  return { ariaOrientation: attribute('aria-orientation'), className: attribute('class') };
};

const styledOrientations = (className: string) => {
  return new Set(Array.from(className.matchAll(/aria-\[orientation=(\w+)\]:/g), ([, orientation]) => orientation));
};

describe('ResizableHandle', () => {
  it('should apply its stacked-layout styles in a vertical group, keyed on the aria-orientation the library renders there', () => {
    const { ariaOrientation, className } = renderSeparator('vertical');
    expect(styledOrientations(className)).toStrictEqual(new Set([ariaOrientation]));
  });

  it('should leave its stacked-layout styles off in a horizontal group, so the handle stays a vertical bar', () => {
    const { ariaOrientation, className } = renderSeparator('horizontal');
    expect(styledOrientations(className)).not.toContain(ariaOrientation);
  });

  it('should keep the caller class name, which MainContent uses to set the margin beside the preview', () => {
    expect(renderSeparator('horizontal').className.split(' ')).toContain('mr-12');
  });
});

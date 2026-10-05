import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useIsDesktop } from '../useIsDesktop';

type HappyDOMWindowAPI = { setViewport: (viewport: { width: number }) => void };

const initialWidth = window.innerWidth;

function isHappyDOMWindowAPI(value: unknown): value is HappyDOMWindowAPI {
  return typeof value === 'object' && value !== null && 'setViewport' in value;
}

/** happy-dom evaluates media queries against its own window, which assigning to `innerWidth` does not reach. */
function setViewportWidth(width: number) {
  const api: unknown = Reflect.get(window, 'happyDOM');
  if (!isHappyDOMWindowAPI(api)) {
    throw new Error('This test requires the happy-dom environment');
  }
  api.setViewport({ width });
}

describe('useIsDesktop', () => {
  afterEach(() => {
    cleanup();
    setViewportWidth(initialWidth);
  });

  it('should treat a viewport at the 768px breakpoint as a desktop', () => {
    setViewportWidth(768);
    expect(renderHook(() => useIsDesktop()).result.current).toBe(true);
  });

  it('should treat a viewport narrower than 768px as a mobile device', () => {
    setViewportWidth(767);
    expect(renderHook(() => useIsDesktop()).result.current).toBe(false);
  });
});

// @vitest-environment happy-dom

import { StrictMode } from 'react';

import { beforeAll, describe, expect, it, vi } from 'vitest';

import { Root } from '../root';

import type { RootProps } from '../root';

const { hydrateRoot } = vi.hoisted(() => ({
  hydrateRoot: vi.fn<typeof import('react-dom/client').hydrateRoot>()
}));

vi.mock('react-dom/client', () => ({ hydrateRoot }));

const ROOT_PROPS: RootProps = { instruments: [{ name: 'happiness', type: 'forms' }], page: 'index' };

describe('client', () => {
  beforeAll(async () => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.stubGlobal('__ROOT_PROPS__', ROOT_PROPS);
    await import('../client');
    vi.unstubAllGlobals();
  });

  it('should hydrate the server-rendered #root element, so the SSR markup is reused rather than replaced', () => {
    expect(hydrateRoot.mock.lastCall?.[0]).toBe(document.getElementById('root'));
  });

  it('should hydrate Root in strict mode with the server-injected props, so the client tree matches the SSR markup', () => {
    expect(hydrateRoot.mock.lastCall?.[1]).toMatchObject({
      props: { children: { props: ROOT_PROPS, type: Root } },
      type: StrictMode
    });
  });
});

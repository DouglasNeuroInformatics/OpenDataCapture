// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { encodeUnicodeToBase64 } from '../../index.js';

type TestInstrumentContent = {
  __injectHead?: { scripts?: string[]; style?: string };
  html?: string;
  meta?: { [name: string]: string };
  render: (done: (data: unknown) => void) => void;
  staticAssets?: { [path: string]: string };
};

type ServiceWorkerOptions = {
  active?: boolean;
  controlled?: boolean;
  messages?: unknown[];
};

const THEME_ATTRIBUTE = 'data-mode';

let parentDocument: Document;

function createParentDocument(theme: null | string) {
  const doc = document.implementation.createHTMLDocument();
  if (theme !== null) {
    doc.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }
  return doc;
}

function createFrameElement(bundle: null | string) {
  const frame = document.createElement('iframe');
  if (bundle !== null) {
    frame.setAttribute('data-bundle', bundle);
  }
  return frame;
}

function createServiceWorker({ active = true, controlled = true, messages = [] }: ServiceWorkerOptions = {}) {
  const postMessage = vi.fn((_message: unknown, [port]: MessagePort[]) => {
    [...messages, { type: 'STATIC_ASSETS_READY' }].forEach((message) => port?.postMessage(message));
  });
  const controllerChangeListeners: (() => void)[] = [];
  const serviceWorker = {
    addEventListener: vi.fn((_type: string, listener: () => void) => controllerChangeListeners.push(listener)),
    controller: controlled ? {} : null,
    ready: Promise.resolve({ active: active ? { postMessage } : null }),
    register: vi.fn(() => Promise.resolve())
  };
  vi.stubGlobal('navigator', { serviceWorker });
  return {
    changeController: () => controllerChangeListeners.forEach((listener) => listener()),
    postMessage,
    serviceWorker
  };
}

async function bootstrap(content: Partial<TestInstrumentContent>) {
  const render = vi.fn(content.render);
  vi.stubGlobal('__testInstrument', { content: { ...content, render } });
  vi.stubGlobal('frameElement', createFrameElement('__testInstrument'));
  await import('../bootstrap.js');
  return render;
}

async function bootstrapAndRender(content: Partial<TestInstrumentContent>) {
  const render = await bootstrap(content);
  await vi.waitFor(() => expect(render).toHaveBeenCalled());
  return render;
}

beforeEach(() => {
  vi.resetModules();
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  parentDocument = createParentDocument('light');
  vi.stubGlobal('parent', { document: parentDocument });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('theme', () => {
  it('should copy the parent theme on load, so the instrument matches the host app', async () => {
    parentDocument.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
    await bootstrapAndRender({});
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('should log an unexpected parent theme on load instead of applying it', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    parentDocument.documentElement.setAttribute(THEME_ATTRIBUTE, 'sepia');
    await bootstrapAndRender({});
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("'sepia'"));
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBeNull();
  });

  it('should follow later parent theme changes, so toggling the host theme restyles the instrument', async () => {
    await bootstrapAndRender({});
    parentDocument.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
    await vi.waitFor(() => expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark'));
  });

  it('should log an unexpected later parent theme instead of applying it', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await bootstrapAndRender({});
    parentDocument.documentElement.setAttribute(THEME_ATTRIBUTE, 'sepia');
    await vi.waitFor(() => expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("'sepia'")));
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light');
  });

  it('should ignore changes to other parent attributes', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await bootstrapAndRender({});
    parentDocument.documentElement.setAttribute('class', 'sepia');
    parentDocument.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
    await vi.waitFor(() => expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark'));
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe('bundle', () => {
  it('should throw when the frame element carries no bundle, so a broken embed fails loudly', async () => {
    vi.stubGlobal('frameElement', createFrameElement(null));
    await expect(import('../bootstrap.js')).rejects.toThrow("Failed to get 'data-bundle' attribute");
  });

  it('should throw when the script runs outside a frame', async () => {
    vi.stubGlobal('frameElement', null);
    await expect(import('../bootstrap.js')).rejects.toThrow("Failed to get 'data-bundle' attribute");
  });
});

describe('content', () => {
  it('should forward the data passed to done as a done event on the parent document', async () => {
    const onDone = vi.fn();
    parentDocument.addEventListener('done', (event) => onDone(event instanceof CustomEvent && event.detail));
    await bootstrapAndRender({ render: (done) => done({ score: 42 }) });
    expect(onDone).toHaveBeenCalledWith({ score: 42 });
  });

  it('should append a meta tag for each meta entry', async () => {
    await bootstrapAndRender({ meta: { author: 'Jane Doe' } });
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="author"]')?.content).toBe('Jane Doe');
  });

  it('should inject the decoded style into the head', async () => {
    await bootstrapAndRender({ __injectHead: { style: encodeUnicodeToBase64('body { color: red; }') } });
    expect(document.head.querySelector('style')?.textContent).toBe('body { color: red; }');
  });

  it('should inject the decoded scripts into the head', async () => {
    await bootstrapAndRender({ __injectHead: { scripts: [encodeUnicodeToBase64('globalThis.injected = true;')] } });
    const script = document.head.querySelector('script');
    expect(script?.type).toBe('text/javascript');
    expect(script?.textContent).toBe('globalThis.injected = true;');
  });

  it('should append the instrument html to the body', async () => {
    await bootstrapAndRender({ html: '<p id="greeting">Hello</p>' });
    expect(document.getElementById('greeting')?.textContent).toBe('Hello');
  });

  it('should inject nothing when the instrument declares only a render function', async () => {
    await bootstrapAndRender({});
    expect(document.head.childElementCount).toBe(0);
    expect(document.body.childElementCount).toBe(0);
  });
});

describe('static assets', () => {
  const staticAssets = { '/hello.txt': 'data:text/plain,hi' };

  it('should register the service worker scoped to the iframe directory', async () => {
    const { serviceWorker } = createServiceWorker();
    await bootstrapAndRender({ staticAssets });
    expect(serviceWorker.register).toHaveBeenCalledWith('./worker.js', { scope: './' });
  });

  it('should post the static assets to the active worker before rendering', async () => {
    const { postMessage } = createServiceWorker({ messages: [null, { type: 'OTHER' }] });
    await bootstrapAndRender({ staticAssets });
    expect(postMessage.mock.lastCall?.[0]).toEqual({ staticAssets, type: 'STATIC_ASSETS' });
  });

  it('should wait for the worker to take control before posting assets, so the first fetch is intercepted', async () => {
    const { changeController, postMessage, serviceWorker } = createServiceWorker({ controlled: false });
    const render = await bootstrap({ staticAssets });
    await vi.waitFor(() => expect(serviceWorker.addEventListener).toHaveBeenCalled());
    expect(postMessage).not.toHaveBeenCalled();
    changeController();
    await vi.waitFor(() => expect(render).toHaveBeenCalled());
  });

  it('should not render while no worker is active, so the instrument never loads without its assets', async () => {
    const { serviceWorker } = createServiceWorker({ active: false });
    const render = await bootstrap({ staticAssets });
    await vi.waitFor(() => expect(serviceWorker.register).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(render).not.toHaveBeenCalled();
  });
});

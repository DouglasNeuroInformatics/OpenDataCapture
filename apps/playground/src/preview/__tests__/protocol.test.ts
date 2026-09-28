import { describe, expect, it } from 'vitest';

import { $EditorMessage, $PreviewMessage, deserializeError, resolvePreviewOrigin, serializeError } from '../protocol';

const location = (origin: string) => {
  const url = new URL(origin);
  return { hostname: url.hostname, origin: url.origin, port: url.port, protocol: url.protocol };
};

describe('resolvePreviewOrigin', () => {
  it('should use the configured origin when it differs from the page, so a deployment can name its preview host', () => {
    expect(
      resolvePreviewOrigin(location('https://playground.example.org'), 'https://preview.example.org/')
    ).toStrictEqual({
      origin: 'https://preview.example.org',
      status: 'ok'
    });
  });

  it('should refuse a configured origin equal to the page, since the frame would then share its storage', () => {
    expect(
      resolvePreviewOrigin(location('https://playground.example.org'), 'https://playground.example.org')
    ).toStrictEqual({
      reason: 'same-origin',
      status: 'error'
    });
  });

  it('should pair localhost with 127.0.0.1 on the same port, so a dev server needs no configuration', () => {
    expect(resolvePreviewOrigin(location('http://localhost:3750'), '')).toStrictEqual({
      origin: 'http://127.0.0.1:3750',
      status: 'ok'
    });
    expect(resolvePreviewOrigin(location('http://127.0.0.1:3750'), '')).toStrictEqual({
      origin: 'http://localhost:3750',
      status: 'ok'
    });
  });

  it('should refuse an unconfigured host that is not a loopback name, rather than fall back to the page origin', () => {
    expect(resolvePreviewOrigin(location('https://playground.example.org'), '')).toStrictEqual({
      reason: 'unknown-host',
      status: 'error'
    });
  });
});

describe('serializeError', () => {
  it('should survive a round trip with its name, stack and cause, so the editor can show what the frame saw', () => {
    const cause = new TypeError('inner');
    const error = new Error('outer', { cause });
    const restored = deserializeError(serializeError(error));
    expect(restored.message).toBe('outer');
    expect(restored.stack).toBe(error.stack);
    expect(restored.cause).toBeInstanceOf(Error);
    expect((restored.cause as Error).name).toBe('TypeError');
    expect((restored.cause as Error).message).toBe('inner');
  });

  it('should describe a thrown non-error as an error, since instrument code may throw anything', () => {
    expect(serializeError('boom')).toStrictEqual({ message: 'boom', name: 'Error' });
  });
});

describe('message schemas', () => {
  it('should accept a render message and reject one carrying a theme outside the known pair', () => {
    expect($EditorMessage.safeParse({ bundle: 'x', language: 'en', theme: 'dark', type: 'render' }).success).toBe(true);
    expect($EditorMessage.safeParse({ bundle: 'x', language: 'en', theme: 'sepia', type: 'render' }).success).toBe(
      false
    );
  });

  it('should reject a message from the frame that names an unknown type, so nothing acts on unparsed data', () => {
    expect($PreviewMessage.safeParse({ type: 'ready' }).success).toBe(true);
    expect($PreviewMessage.safeParse({ to: 'https://example.org', type: 'navigate' }).success).toBe(false);
  });
});

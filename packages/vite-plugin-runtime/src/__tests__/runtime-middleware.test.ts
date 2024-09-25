import { describe, expect, it, vi } from 'vitest';

import * as loadResource from '../load-resource.js';
import { runtimeMiddleware } from '../runtime-middleware.js';

describe('runtimeMiddleware', () => {
  it('should invoke next if the request url is null', () => {
    const next = vi.fn();
    expect(runtimeMiddleware({ url: null } as any, {} as any, next));
    expect(next).toHaveBeenCalledOnce();
  });
  it('should invoke next if the request url is /', () => {
    const next = vi.fn();
    expect(runtimeMiddleware({ url: '/' } as any, {} as any, next));
    expect(next).toHaveBeenCalledOnce();
  });
  it('should invoke next if the request url is /v0', () => {
    const next = vi.fn();
    runtimeMiddleware({ url: '/runtime' } as any, {} as any, next);
    expect(next).toHaveBeenCalledOnce();
  });
  it('should attempt to load the resource if the request url is /v0/foo.js, but call next if it does not exist', async () => {
    const next = vi.fn();
    vi.spyOn(loadResource, 'loadResource').mockResolvedValueOnce(null);
    await new Promise<void>((resolve) => {
      runtimeMiddleware({ url: '/v0/foo.js' } as any, {} as any, () => {
        next();
        resolve();
      });
    });
    expect(loadResource.loadResource).toHaveBeenCalledOnce();
    expect(loadResource.loadResource).toHaveBeenCalledWith('v0', 'foo.js');
    expect(next).toHaveBeenCalledOnce();
  });
  it('should attempt to load the resource if the request url is /v0/foo.js, and write to the response if it exists', async () => {
    const end = vi.fn();
    vi.spyOn(loadResource, 'loadResource').mockResolvedValueOnce({} as any);
    await new Promise<void>((resolve) => {
      runtimeMiddleware(
        { url: '/v0/foo.js' } as any,
        {
          end: () => {
            end();
            resolve();
          },
          writeHead: vi.fn()
        } as any,
        null!
      );
    });
    expect(loadResource.loadResource).toHaveBeenCalledOnce();
    expect(loadResource.loadResource).toHaveBeenCalledWith('v0', 'foo.js');
    expect(end).toHaveBeenCalledOnce();
  });
});

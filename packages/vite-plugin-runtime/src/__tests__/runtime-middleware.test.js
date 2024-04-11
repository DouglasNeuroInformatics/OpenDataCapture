// @ts-nocheck

import { describe, expect, it, vi } from 'vitest';

import * as loadResourceModule from '../load-resource.js';
import { runtimeMiddleware } from '../runtime-middleware.js';

describe('runtimeMiddleware', () => {
  it('should invoke next if the request url is null', () => {
    const next = vi.fn();
    expect(runtimeMiddleware({ url: null }, {}, next));
    expect(next).toHaveBeenCalledOnce();
  });
  it('should invoke next if the request url is /', () => {
    const next = vi.fn();
    expect(runtimeMiddleware({ url: '/' }, {}, next));
    expect(next).toHaveBeenCalledOnce();
  });
  it('should invoke next if the request url is /v0', () => {
    const next = vi.fn();
    runtimeMiddleware({ url: '/runtime' }, {}, next);
    expect(next).toHaveBeenCalledOnce();
  });
  it('should attempt to load the resource if the request url is /v0/foo.js, but call next if it does not exist', async () => {
    const next = vi.fn();
    vi.spyOn(loadResourceModule, 'loadResource').mockResolvedValueOnce(null);
    await new Promise((resolve) => {
      runtimeMiddleware({ url: '/v0/foo.js' }, {}, () => {
        next();
        resolve();
      });
    });
    expect(loadResourceModule.loadResource).toHaveBeenCalledOnce();
    expect(loadResourceModule.loadResource).toHaveBeenCalledWith('v0', 'foo.js');
    expect(next).toHaveBeenCalledOnce();
  });
  it('should attempt to load the resource if the request url is /v0/foo.js, and write to the response if it exists', async () => {
    const end = vi.fn();
    vi.spyOn(loadResourceModule, 'loadResource').mockResolvedValueOnce({});
    await new Promise((resolve) => {
      runtimeMiddleware(
        { url: '/v0/foo.js' },
        {
          end: () => {
            end();
            resolve();
          },
          writeHead: vi.fn()
        }
      );
    });
    expect(loadResourceModule.loadResource).toHaveBeenCalledOnce();
    expect(loadResourceModule.loadResource).toHaveBeenCalledWith('v0', 'foo.js');
    expect(end).toHaveBeenCalledOnce();
  });
});

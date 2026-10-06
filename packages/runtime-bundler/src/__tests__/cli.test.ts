import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// `cli.ts` resolves `runtime.config.js` from `process.cwd()`, so each test chdirs into a fresh temp
// directory and re-imports a fresh module instance. It calls `process.exit(1)` on every failure
// path; mocking it to throw lets a test observe that without killing the worker process.
let tmpDir: string;
let originalCwd: string;
let exitSpy: ReturnType<typeof vi.spyOn>;

/** Replaces the real bundler for one import of `cli.ts`, so a test controls whether a bundle succeeds. */
function mockBundle(bundle: () => Promise<void>) {
  vi.doMock('../bundler.js', () => ({
    Bundler: class {
      bundle = bundle;
    }
  }));
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-bundler-cli-'));
  originalCwd = process.cwd();
  process.chdir(tmpDir);
  exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`EXIT:${code}`);
  });
  vi.resetModules();
});

afterEach(() => {
  vi.doUnmock('../bundler.js');
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { force: true, recursive: true });
  exitSpy.mockRestore();
  vi.restoreAllMocks();
});

describe('cli', () => {
  it('should exit when runtime.config.js cannot be resolved from the working directory', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(import('../cli.js')).rejects.toThrow('EXIT:1');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to resolve file 'runtime.config.js'"));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to import config file'));
  });

  it('should exit when the config file has no default export', async () => {
    fs.writeFileSync(path.join(tmpDir, 'runtime.config.js'), 'export const notDefault = {};\n');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(import('../cli.js')).rejects.toThrow('EXIT:1');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Missing required default export'));
  });

  it('should exit when the default export fails the config schema', async () => {
    fs.writeFileSync(path.join(tmpDir, 'runtime.config.js'), 'export default { outdir: 123 };\n');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(import('../cli.js')).rejects.toThrow('EXIT:1');
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid structure of default export'));
  });

  it('should log the error message when the bundle fails, rather than reporting success', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'runtime.config.js'),
      "export default { include: ['does-not-exist'], outdir: 'dist' };\n"
    );
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await import('../cli.js');
    expect(
      errorSpy.mock.calls.some(([message]) => typeof message === 'string' && message.includes('does-not-exist'))
    ).toBe(true);
    expect(logSpy).not.toHaveBeenCalledWith('Success!');
  });

  it('should bundle a single config object and report success', async () => {
    fs.writeFileSync(path.join(tmpDir, 'runtime.config.js'), "export default { include: [], outdir: 'dist' };\n");
    const bundle = vi.fn(() => Promise.resolve());
    mockBundle(bundle);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await import('../cli.js');
    expect(bundle).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('Success!');
  });

  it('should log a thrown non-error value as is, since it carries no message', async () => {
    fs.writeFileSync(path.join(tmpDir, 'runtime.config.js'), "export default { include: [], outdir: 'dist' };\n");
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- the cli must report a rejection that is not an Error
    mockBundle(() => Promise.reject('not an error'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await import('../cli.js');
    expect(errorSpy).toHaveBeenCalledWith('not an error');
  });
});

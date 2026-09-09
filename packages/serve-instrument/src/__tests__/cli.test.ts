import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// `cli.ts` runs `program.parse()` at module top level, against `process.argv`, so each test stubs
// argv and re-imports a fresh module instance. `commander` calls `process.exit` on an invalid
// argument; mocking it to throw lets a test observe that without killing the worker process, and
// `Server.create`/`start` are mocked so no real port is ever bound.
const { serverCreate, serverStart } = vi.hoisted(() => ({
  serverCreate: vi.fn(),
  serverStart: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../server.js', () => ({
  Server: { create: serverCreate }
}));

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-instrument-cli-'));
  serverCreate.mockResolvedValue({ start: serverStart });
  vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`EXIT:${code}`);
  });
  vi.resetModules();
});

afterEach(() => {
  fs.rmSync(tmpDir, { force: true, recursive: true });
  vi.restoreAllMocks();
  serverCreate.mockReset();
  serverStart.mockClear();
});

describe('cli', () => {
  it('should start a single-mode server on the given directory with the default port', async () => {
    process.argv = ['node', 'cli.js', tmpDir];
    await import('../cli.js');
    await vi.waitFor(() => {
      expect(serverCreate).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'single', port: 3000, target: tmpDir, verbose: false })
      );
    });
    expect(serverStart).toHaveBeenCalledOnce();
  });

  it('should parse a custom port', async () => {
    process.argv = ['node', 'cli.js', tmpDir, '--port', '4321'];
    await import('../cli.js');
    await vi.waitFor(() => {
      expect(serverCreate).toHaveBeenCalledWith(expect.objectContaining({ port: 4321 }));
    });
  });

  it('should exit with an error when the port is not a number', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.argv = ['node', 'cli.js', tmpDir, '--port', 'not-a-number'];
    await expect(import('../cli.js')).rejects.toThrow(/EXIT/);
    errorSpy.mockRestore();
  });

  it('should start an all-mode server when a forms/ subdirectory exists', async () => {
    fs.mkdirSync(path.join(tmpDir, 'forms'));
    process.argv = ['node', 'cli.js', tmpDir, '--all'];
    await import('../cli.js');
    await vi.waitFor(() => {
      expect(serverCreate).toHaveBeenCalledWith(expect.objectContaining({ mode: 'all' }));
    });
  });

  it('should start an all-mode server when an interactive/ subdirectory exists', async () => {
    fs.mkdirSync(path.join(tmpDir, 'interactive'));
    process.argv = ['node', 'cli.js', tmpDir, '--all'];
    await import('../cli.js');
    await vi.waitFor(() => {
      expect(serverCreate).toHaveBeenCalledWith(expect.objectContaining({ mode: 'all' }));
    });
  });

  /**
   * `parseTarget` is called by hand inside the async `.action()` body rather than passed to
   * `.argument()` as commander's own parser, so throwing `InvalidArgumentError` here does not go
   * through commander's usual exit-with-message handling. The rejection does not even propagate to
   * the dynamic `import()` promise — it becomes a bare unhandled rejection on the process, which in
   * a real run prints an ugly stack trace and crashes rather than the clean CLI error the author
   * intended. Filed as a bug in the final report rather than fixed here (no product-code changes).
   */
  function waitForUnhandledRejection(): Promise<unknown> {
    return new Promise((resolve) => {
      process.once('unhandledRejection', resolve);
    });
  }

  it('should surface an unhandled rejection (rather than exit cleanly) in --all mode when neither subdirectory exists', async () => {
    const rejection = waitForUnhandledRejection();
    process.argv = ['node', 'cli.js', tmpDir, '--all'];
    await import('../cli.js');
    await expect(rejection).resolves.toMatchObject({
      message: expect.stringContaining(
        'In --all mode, directory must contain a forms/ and/or interactive/ subdirectory'
      )
    });
  });

  it('should surface an unhandled rejection (rather than exit cleanly) when the target directory does not exist', async () => {
    const rejection = waitForUnhandledRejection();
    process.argv = ['node', 'cli.js', path.join(tmpDir, 'missing')];
    await import('../cli.js');
    await expect(rejection).resolves.toMatchObject({ message: expect.stringContaining('Directory does not exist') });
  });

  it('should surface an unhandled rejection (rather than exit cleanly) when the target is not a directory', async () => {
    const filePath = path.join(tmpDir, 'not-a-directory.txt');
    fs.writeFileSync(filePath, '');
    const rejection = waitForUnhandledRejection();
    process.argv = ['node', 'cli.js', filePath];
    await import('../cli.js');
    await expect(rejection).resolves.toMatchObject({ message: expect.stringContaining('Not a directory') });
  });

  it('should pass verbose through when --verbose is given', async () => {
    process.argv = ['node', 'cli.js', tmpDir, '--verbose'];
    await import('../cli.js');
    await vi.waitFor(() => {
      expect(serverCreate).toHaveBeenCalledWith(expect.objectContaining({ verbose: true }));
    });
  });
});

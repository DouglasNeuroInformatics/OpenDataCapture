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

  // `parseTarget` is commander's own parser for `<target>`, so an `InvalidArgumentError` it throws
  // takes the same print-message-and-exit path as the `--port` validator above, rather than escaping
  // the async `.action()` body as an unhandled rejection. Each case asserts the process exits and
  // never reaches `Server.create`.
  async function expectCleanExit(argv: string[], message: string) {
    // commander prints through `process.stderr.write`, not `console.error`. Restore the spy before
    // asserting: vitest reports a failure on stderr, so a throw while it is still stubbed would
    // swallow the very message explaining what broke.
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    process.argv = ['node', 'cli.js', ...argv];
    await expect(import('../cli.js')).rejects.toThrow(/EXIT/);
    const written = stderrSpy.mock.calls.flat().join(' ');
    stderrSpy.mockRestore();
    expect(written).toContain(message);
    expect(serverCreate).not.toHaveBeenCalled();
  }

  it('should exit cleanly in --all mode when neither subdirectory exists', async () => {
    await expectCleanExit(
      [tmpDir, '--all'],
      'In --all mode, directory must contain a forms/ and/or interactive/ subdirectory'
    );
  });

  it('should exit cleanly when the target directory does not exist', async () => {
    await expectCleanExit([path.join(tmpDir, 'missing')], 'Directory does not exist');
  });

  it('should exit cleanly when the target is not a directory', async () => {
    const filePath = path.join(tmpDir, 'not-a-directory.txt');
    fs.writeFileSync(filePath, '');
    await expectCleanExit([filePath], 'Not a directory');
  });

  it('should pass verbose through when --verbose is given', async () => {
    process.argv = ['node', 'cli.js', tmpDir, '--verbose'];
    await import('../cli.js');
    await vi.waitFor(() => {
      expect(serverCreate).toHaveBeenCalledWith(expect.objectContaining({ verbose: true }));
    });
  });
});

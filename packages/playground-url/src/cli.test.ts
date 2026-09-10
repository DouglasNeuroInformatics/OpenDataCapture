import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// `cli.ts` runs `program.parse()` at module top level, against `process.argv`, so each test stubs
// argv and re-imports a fresh module instance. `commander` calls `process.exit` on an invalid
// argument; mocking it to throw lets a test observe that without killing the worker process.
let tmpDir: string;
let stdoutSpy: ReturnType<typeof vi.spyOn>;
let stderrSpy: ReturnType<typeof vi.spyOn>;

vi.mock('node:child_process', () => ({ spawn: vi.fn(() => ({ unref: vi.fn() })) }));

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'playground-url-cli-'));
  vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`EXIT:${code}`);
  });
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  vi.resetModules();
});

afterEach(() => {
  fs.rmSync(tmpDir, { force: true, recursive: true });
  vi.restoreAllMocks();
});

describe('cli', () => {
  it('should write a share URL to stdout for a directory of shareable source files', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    process.argv = ['node', 'cli.js', tmpDir];
    await import('./cli.js');
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('https://playground.opendatacapture.org'));
  });

  it('should warn and skip a binary asset rather than embed it', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    fs.writeFileSync(path.join(tmpDir, 'icon.png'), Buffer.from([0, 1, 2]));
    process.argv = ['node', 'cli.js', tmpDir];
    await import('./cli.js');
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("Skipping 'icon.png'"));
  });

  it('should ignore a subdirectory rather than read it as a file', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    fs.mkdirSync(path.join(tmpDir, 'nested'));
    process.argv = ['node', 'cli.js', tmpDir];
    await import('./cli.js');
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('https://playground.opendatacapture.org'));
  });

  it('should set a non-zero exit code and write no URL when the directory has nothing shareable', async () => {
    process.argv = ['node', 'cli.js', tmpDir];
    await import('./cli.js');
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('No shareable source files found'));
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });

  it('should use the directory name as the label when none is given', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    process.argv = ['node', 'cli.js', tmpDir];
    const { decodeShareURL } = await import('./share-url.js');
    await import('./cli.js');
    const href = stdoutSpy.mock.calls
      .map(([chunk]: [unknown]) => chunk)
      .find((chunk: unknown) => typeof chunk === 'string' && chunk.includes('http'));
    const decoded = decodeShareURL(new URL((href as string).trim()));
    expect(decoded?.label).toBe(path.basename(tmpDir));
  });

  it('should use the given label and mark the link fullscreen when requested', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    process.argv = ['node', 'cli.js', tmpDir, '--label', 'My Label', '--fullscreen'];
    const { decodeShareURL, isFullscreenShareURL } = await import('./share-url.js');
    await import('./cli.js');
    const href = stdoutSpy.mock.calls
      .map(([chunk]: [unknown]) => chunk)
      .find((chunk: unknown) => typeof chunk === 'string' && chunk.includes('http'));
    const url = new URL((href as string).trim());
    expect(decodeShareURL(url)?.label).toBe('My Label');
    expect(isFullscreenShareURL(url)).toBe(true);
  });

  it('should open the generated link in the browser when --open is given', async () => {
    const { spawn } = await import('node:child_process');
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    process.argv = ['node', 'cli.js', tmpDir, '--open'];
    await import('./cli.js');
    expect(spawn).toHaveBeenCalled();
  });

  it("should open with the platform's own command on win32 and any other platform", async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    const platformSpy = vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
    process.argv = ['node', 'cli.js', tmpDir, '--open'];
    const { spawn } = await import('node:child_process');
    await import('./cli.js');
    expect(spawn).toHaveBeenCalledWith('start', expect.anything(), expect.objectContaining({ shell: true }));
    platformSpy.mockRestore();
  });

  it('should not pluralize the file count when exactly one file was encoded', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    process.argv = ['node', 'cli.js', tmpDir];
    await import('./cli.js');
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('Encoded 1 file '));
  });

  it('should pluralize the file count when more than one file was encoded', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    fs.writeFileSync(path.join(tmpDir, 'styles.css'), 'body {}');
    process.argv = ['node', 'cli.js', tmpDir];
    await import('./cli.js');
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('Encoded 2 files '));
  });

  it('should resolve --base-url against its origin, dropping any path', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    process.argv = ['node', 'cli.js', tmpDir, '--base-url', 'https://example.org/some/path'];
    await import('./cli.js');
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('https://example.org/?'));
  });

  it('should exit with an error when --base-url is not a valid URL', async () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), 'export default {};');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.argv = ['node', 'cli.js', tmpDir, '--base-url', 'not-a-url'];
    await expect(import('./cli.js')).rejects.toThrow(/EXIT/);
    errorSpy.mockRestore();
  });

  it('should exit with an error when the target directory does not exist', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.argv = ['node', 'cli.js', path.join(tmpDir, 'missing')];
    await expect(import('./cli.js')).rejects.toThrow(/EXIT/);
    errorSpy.mockRestore();
  });

  it('should exit with an error when the target is not a directory', async () => {
    const filePath = path.join(tmpDir, 'not-a-directory.txt');
    fs.writeFileSync(filePath, '');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.argv = ['node', 'cli.js', filePath];
    await expect(import('./cli.js')).rejects.toThrow(/EXIT/);
    errorSpy.mockRestore();
  });
});

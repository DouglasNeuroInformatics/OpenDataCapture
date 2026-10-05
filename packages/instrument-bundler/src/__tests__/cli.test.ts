import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// `cli.ts` runs `program.parse()` at module top level, against `process.argv`, so each test stubs
// argv and re-imports a fresh module instance. `commander` calls `process.exit` on an invalid
// argument; mocking it to throw lets a test observe that without killing the worker process.
let tmpDir: string;
let inputBase: string;
let outputBase: string;
let exitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'instrument-bundler-cli-'));
  inputBase = path.join(tmpDir, 'input');
  outputBase = path.join(tmpDir, 'output');
  fs.mkdirSync(path.join(inputBase, 'FORM_INSTRUMENT_STUB'), { recursive: true });
  fs.writeFileSync(
    path.join(inputBase, 'FORM_INSTRUMENT_STUB', 'index.ts'),
    'export default { content: {}, details: {}, kind: "FORM", language: "en", measures: {} };'
  );
  exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`EXIT:${code}`);
  });
  vi.resetModules();
});

afterEach(() => {
  fs.rmSync(tmpDir, { force: true, recursive: true });
  exitSpy.mockRestore();
  vi.restoreAllMocks();
});

describe('cli', () => {
  it('should write the raw bundle to a .js file mirroring the input directory name', async () => {
    process.argv = ['node', 'cli.js', inputBase, '--outdir', outputBase, '--raw'];
    await import('../cli.js');
    const content = fs.readFileSync(path.join(outputBase, 'FORM_INSTRUMENT_STUB.js'), 'utf-8');
    expect(content.trimStart().startsWith('(async')).toBe(true);
  });

  it('should wrap the bundle as a default export string when --raw is not given', async () => {
    process.argv = ['node', 'cli.js', inputBase, '--outdir', outputBase];
    await import('../cli.js');
    const content = fs.readFileSync(path.join(outputBase, 'FORM_INSTRUMENT_STUB.js'), 'utf-8');
    expect(content.startsWith('export default ')).toBe(true);
    expect(() => JSON.parse(content.replace('export default ', ''))).not.toThrow();
  });

  it('should resolve a relative target and outdir against the current working directory', async () => {
    const relativeInputBase = path.relative(process.cwd(), inputBase);
    const relativeOutputBase = path.relative(process.cwd(), outputBase);
    process.argv = ['node', 'cli.js', relativeInputBase, '--outdir', relativeOutputBase];
    await import('../cli.js');
    expect(fs.existsSync(path.join(outputBase, 'FORM_INSTRUMENT_STUB.js'))).toBe(true);
  });

  it('should emit a declaration file alongside the bundle when --declaration is given', async () => {
    process.argv = ['node', 'cli.js', inputBase, '--outdir', outputBase, '--declaration'];
    await import('../cli.js');
    const declaration = fs.readFileSync(path.join(outputBase, 'FORM_INSTRUMENT_STUB.d.ts'), 'utf-8');
    expect(declaration).toContain('declare const bundle: string;');
  });

  it('should remove the existing output directory first when --clean is given', async () => {
    fs.mkdirSync(outputBase, { recursive: true });
    fs.writeFileSync(path.join(outputBase, 'stale.txt'), 'stale');
    process.argv = ['node', 'cli.js', inputBase, '--outdir', outputBase, '--clean'];
    await import('../cli.js');
    expect(fs.existsSync(path.join(outputBase, 'stale.txt'))).toBe(false);
  });

  it('should log verbose progress messages only when --verbose is given', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    process.argv = ['node', 'cli.js', inputBase, '--outdir', outputBase, '--verbose'];
    await import('../cli.js');
    expect(
      logSpy.mock.calls.some(([message]) => typeof message === 'string' && message.includes('Resolved input base'))
    ).toBe(true);
  });

  it('should write into an output directory that already exists rather than fail to create it', async () => {
    fs.mkdirSync(outputBase, { recursive: true });
    process.argv = ['node', 'cli.js', inputBase, '--outdir', outputBase];
    await import('../cli.js');
    expect(fs.existsSync(path.join(outputBase, 'FORM_INSTRUMENT_STUB.js'))).toBe(true);
  });

  it('should embed a binary asset next to the entry, reading it as bytes rather than text', async () => {
    const pngBytes = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    fs.writeFileSync(path.join(inputBase, 'FORM_INSTRUMENT_STUB', 'logo.png'), pngBytes);
    fs.writeFileSync(
      path.join(inputBase, 'FORM_INSTRUMENT_STUB', 'index.ts'),
      'import logo from "./logo.png"; export default { content: {}, details: { logo }, kind: "FORM", language: "en", measures: {} };'
    );
    process.argv = ['node', 'cli.js', inputBase, '--outdir', outputBase, '--raw'];
    await import('../cli.js');
    const content = fs.readFileSync(path.join(outputBase, 'FORM_INSTRUMENT_STUB.js'), 'utf-8');
    expect(content).toContain(`data:image/png;base64,${pngBytes.toString('base64')}`);
  });

  it('should warn and skip a target directory whose name the input glob cannot match', async () => {
    fs.mkdirSync(path.join(inputBase, '[x]'));
    fs.writeFileSync(path.join(inputBase, '[x]', 'index.ts'), 'export default {};');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    process.argv = ['node', 'cli.js', inputBase, '--outdir', outputBase];
    await import('../cli.js');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to find any input files in directory'));
    expect(fs.existsSync(path.join(outputBase, '[x].js'))).toBe(false);
  });

  it('should exit with an error when the target directory does not exist', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.argv = ['node', 'cli.js', path.join(tmpDir, 'missing'), '--outdir', outputBase];
    await expect(import('../cli.js')).rejects.toThrow(/EXIT/);
    errorSpy.mockRestore();
  });

  it('should exit with an error when the target is not a directory', async () => {
    const filePath = path.join(tmpDir, 'not-a-directory.txt');
    fs.writeFileSync(filePath, '');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.argv = ['node', 'cli.js', filePath, '--outdir', outputBase];
    await expect(import('../cli.js')).rejects.toThrow(/EXIT/);
    errorSpy.mockRestore();
  });
});

import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { pathToFileURL } from 'url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Bundler } from '../src/bundler.js';

/**
 * End-to-end guard for cross-package module sharing. `state-writer` mutates a value owned by
 * `shared-state`; both are bundled as separate entry points. If the bundler inlines its own copy of
 * `shared-state` into `state-writer`, the write lands on a different instance than the one read back,
 * so the value stays `initial`. The two entry points must resolve to a single runtime instance.
 */
describe('bundle (e2e)', () => {
  const fixtures = path.resolve(import.meta.dirname, 'fixtures');
  let workdir: string;
  let distdir: string;

  beforeAll(async () => {
    workdir = await fs.mkdtemp(path.join(os.tmpdir(), 'runtime-bundler-e2e-'));
    distdir = path.join(workdir, 'dist');
    await fs.cp(fixtures, path.join(workdir, 'node_modules'), { recursive: true });
    await fs.writeFile(path.join(workdir, 'package.json'), '{}');
    await new Bundler({
      configFilepath: path.join(workdir, 'package.json'),
      include: ['shared-state', 'state-writer'],
      mode: 'production',
      outdir: distdir
    }).bundle();
  }, 60_000);

  afterAll(async () => {
    await fs.rm(workdir, { force: true, recursive: true });
  });

  it('shares one module instance across entry points that depend on it', async () => {
    const { getValue } = (await import(pathToFileURL(path.join(distdir, 'shared-state/index.js')).href)) as {
      getValue: () => string;
    };
    const { setValue } = (await import(pathToFileURL(path.join(distdir, 'state-writer/index.js')).href)) as {
      setValue: (value: string) => void;
    };
    setValue('shared');
    expect(getValue()).toBe('shared');
  });
});

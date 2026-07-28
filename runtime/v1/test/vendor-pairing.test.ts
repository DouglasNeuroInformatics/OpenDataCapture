import * as fs from 'fs';
import * as module from 'module';
import * as path from 'path';

import { describe, expect, it } from 'vitest';

const VENDOR_DIR = path.resolve(import.meta.dirname, '../../../vendor');

/**
 * Each vendor wrapper declares its intended pairings through workspace dependencies on sibling
 * wrappers (e.g. `react-dom__18.x` depends on `react__18.x`). The wrapped package's own peer
 * resolution must honor that pairing: the physical package its peer resolves to must be the same
 * one the sibling wrapper serves. Otherwise the runtime ships two instances (or two versions) of
 * a package that must exist once, which pnpm will happily produce unless the wrapper pins the
 * real peer explicitly.
 */

function physicalPackageDir(entryPath: string, packageName: string): string {
  const realPath = fs.realpathSync(entryPath);
  const needle = `${path.sep}node_modules${path.sep}${packageName}${path.sep}`;
  const index = realPath.lastIndexOf(needle);
  return index === -1 ? path.dirname(realPath) : realPath.slice(0, index + needle.length);
}

function resolveFrom(dir: string, id: string): null | string {
  const require = module.createRequire(path.join(dir, 'package.json'));
  try {
    return require.resolve(id);
  } catch {
    return null;
  }
}

function findWrapperDirs(): string[] {
  const dirs: string[] = [];
  for (const entry of fs.readdirSync(VENDOR_DIR)) {
    const abspath = path.join(VENDOR_DIR, entry);
    if (!fs.lstatSync(abspath).isDirectory()) {
      continue;
    }
    if (entry.startsWith('@')) {
      for (const scopedEntry of fs.readdirSync(abspath)) {
        const scopedPath = path.join(abspath, scopedEntry);
        if (fs.existsSync(path.join(scopedPath, 'package.json'))) {
          dirs.push(scopedPath);
        }
      }
    } else if (fs.existsSync(path.join(abspath, 'package.json'))) {
      dirs.push(abspath);
    }
  }
  return dirs;
}

describe('vendor wrapper pairing', () => {
  it('resolves each wrapped package peer to the same instance its paired wrapper serves', () => {
    const violations: string[] = [];
    for (const wrapperDir of findWrapperDirs()) {
      const pkg = JSON.parse(fs.readFileSync(path.join(wrapperDir, 'package.json'), 'utf-8')) as {
        dependencies?: { [key: string]: string };
        name: string;
      };
      const wrappedName = pkg.name.split('__')[0]!;
      const wrappedEntry = resolveFrom(wrapperDir, wrappedName);
      if (!wrappedEntry) {
        continue;
      }
      const wrappedDir = physicalPackageDir(wrappedEntry, wrappedName);
      for (const dependency of Object.keys(pkg.dependencies ?? {})) {
        if (!dependency.includes('__')) {
          continue;
        }
        const peerName = dependency.split('__')[0]!;
        if (peerName === wrappedName) {
          continue;
        }
        const actualEntry = resolveFrom(wrappedDir, peerName);
        if (!actualEntry) {
          continue;
        }
        const pairedWrapperDir = path.join(VENDOR_DIR, dependency.split('__').join('@'));
        const expectedEntry = resolveFrom(pairedWrapperDir, peerName);
        if (!expectedEntry) {
          continue;
        }
        const actual = physicalPackageDir(actualEntry, peerName);
        const expected = physicalPackageDir(expectedEntry, peerName);
        if (actual !== expected) {
          violations.push(
            `${pkg.name}: '${peerName}' resolves to '${actual}' but '${dependency}' serves '${expected}'`
          );
        }
      }
    }
    expect(violations).toStrictEqual([]);
  });
});

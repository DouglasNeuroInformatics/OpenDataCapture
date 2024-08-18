import fs from 'fs';
import module from 'module';
import path from 'path';

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { Resolver } from '../resolver.js';

const PACKAGE_STUB = Object.freeze({
  name: 'foo'
});

describe('Resolver', () => {
  let resolver: Resolver;
  let require: { resolve: Mock };

  beforeAll(() => {
    require = { resolve: vi.fn() };
    vi.spyOn(module, 'createRequire').mockImplementation(() => require as any);
    resolver = new Resolver(import.meta.filename);
  });

  describe('invalid packages', () => {
    it('should fail to import a non-existant package', async () => {
      require.resolve.mockImplementationOnce((id) => {
        throw new Error(`Cannot find module '${id.toString()}'`);
      });
      await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
        message: expect.stringContaining(`resolution of '${PACKAGE_STUB.name}/package.json' was unsuccessful`)
      });
    });
    it('should fail to import a package where the specified package.json does not exist', async () => {
      const packageJsonPath = '/home/foo/package.json';
      require.resolve.mockImplementationOnce(() => packageJsonPath);
      vi.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
      await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
        message: expect.stringContaining(`resolved package.json file '${packageJsonPath}' does not exist`)
      });
    });
    it('should fail to import a package where the specified package.json exists, but is not a file', async () => {
      const packageJsonPath = '/dev/null';
      require.resolve.mockImplementationOnce(() => packageJsonPath);
      vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
      vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => false } as any);
      await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
        message: expect.stringContaining(`resolved package.json file '${packageJsonPath}' exists, but is not a file`)
      });
    });
  });

  describe('invalid package.json files', () => {
    let packageJsonPath: string;

    beforeEach(() => {
      packageJsonPath = '/home/foo/package.json';
      require.resolve.mockImplementationOnce(() => packageJsonPath);
      vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
      vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
    });

    it('should fail to import a package where the specified package.json is an empty file', async () => {
      vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce('');
      await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
        message: expect.stringContaining(`failed to parse content of package.json file '${packageJsonPath}'`)
      });
    });

    it('should fail to import a package where the specified package.json content is not a plain object', async () => {
      vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce('null');
      await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
        message: expect.stringContaining(`content 'null' of file '${packageJsonPath}' is not an object`)
      });
    });

    it('should fail to import a package where the specified package.json does not contain exports', async () => {
      vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify(PACKAGE_STUB));
      await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
        message: expect.stringContaining(`file '${packageJsonPath}' does not contain required property 'exports'`)
      });
    });

    it('should fail to import a package where the specified package.json contains a non-object for exports', async () => {
      vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify({ ...PACKAGE_STUB, exports: 0 }));
      await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
        message: expect.stringContaining(`invalid value '0' for property 'exports' in file '${packageJsonPath}'`)
      });
    });

    it('should fail to import a package where the specified package.json contains empty exports', async () => {
      vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify({ ...PACKAGE_STUB, exports: {} }));
      await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
        message: expect.stringContaining('cannot be empty object')
      });
    });
  });

  describe('invalid exports', () => {
    let packageRoot: string;
    let packageJsonPath: string;

    beforeEach(() => {
      packageRoot = '/home/foo';
      packageJsonPath = path.join(packageRoot, 'package.json');
      require.resolve.mockImplementationOnce(() => packageJsonPath);
    });

    describe('importing a package where an export contains an invalid source extension', () => {
      let relpath: string;
      let abspath: string;
      beforeEach(() => {
        relpath = './src/main.py';
        abspath = path.join(packageRoot, relpath);
        vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
        vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
      });
      it('should fail with a default string condition', async () => {
        vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
          JSON.stringify({ ...PACKAGE_STUB, exports: { '.': relpath } })
        );
        await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
          message: expect.stringContaining(
            `file '${abspath}' does not have one of the expected extensions: .json, .js, .mjs`
          )
        });
      });
      it('should fail with an import condition', async () => {
        vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
          JSON.stringify({ ...PACKAGE_STUB, exports: { '.': { import: relpath } } })
        );
        await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
          message: expect.stringContaining(
            `file '${abspath}' does not have one of the expected extensions: .json, .js, .mjs`
          )
        });
      });
    });

    describe('importing a package where an export does not exist', () => {
      let relpath: string;
      let abspath: string;

      beforeEach(() => {
        relpath = './src/main.js';
        abspath = path.join(packageRoot, relpath);
        vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true).mockReturnValueOnce(false);
        vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
      });

      it('should fail with a default string condition', async () => {
        vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
          JSON.stringify({ ...PACKAGE_STUB, exports: { '.': relpath } })
        );
        await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
          message: expect.stringContaining(`file '${abspath}' does not exist`)
        });
      });

      it('should fail with an import condition', async () => {
        vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
          JSON.stringify({ ...PACKAGE_STUB, exports: { '.': { import: relpath } } })
        );
        await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
          message: expect.stringContaining(`file '${abspath}' does not exist`)
        });
      });
    });

    describe('importing a package where an export does not exist', () => {
      let relpath: string;
      let abspath: string;
      beforeEach(() => {
        relpath = './src/main.js';
        abspath = path.join(packageRoot, relpath);
        vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true).mockReturnValueOnce(false);
        vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
      });
      it('should fail with a default string condition', async () => {
        vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
          JSON.stringify({ ...PACKAGE_STUB, exports: { '.': relpath } })
        );
        await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
          message: expect.stringContaining(`file '${abspath}' does not exist`)
        });
      });
      it('should fail with an import condition', async () => {
        vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
          JSON.stringify({ ...PACKAGE_STUB, exports: { '.': { import: relpath } } })
        );
        await expect(resolver.resolve(PACKAGE_STUB.name)).rejects.toMatchObject({
          message: expect.stringContaining(`file '${abspath}' does not exist`)
        });
      });
    });
  });

  describe('valid packages', () => {
    let packageRoot: string;
    let packageJsonPath: string;

    beforeEach(() => {
      packageRoot = '/home/foo';
      packageJsonPath = path.join(packageRoot, 'package.json');
      require.resolve.mockImplementationOnce(() => packageJsonPath);
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should return the exports for a valid, single source string export', async () => {
      const relpath = './src/main.js';
      const abspath = path.join(packageRoot, relpath);
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
      vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
        JSON.stringify({ ...PACKAGE_STUB, exports: { '.': relpath } })
      );
      await expect(resolver.resolve(PACKAGE_STUB.name)).resolves.toMatchObject({
        exports: {
          '.': {
            import: abspath
          }
        }
      });
    });
    it('should return the exports for a valid, single source object export', async () => {
      const relpath = './src/main.js';
      const abspath = path.join(packageRoot, relpath);
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
      vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
        JSON.stringify({ ...PACKAGE_STUB, exports: { '.': { import: relpath } } })
      );
      await expect(resolver.resolve(PACKAGE_STUB.name)).resolves.toMatchObject({
        exports: {
          '.': {
            import: abspath
          }
        }
      });
    });
    it('should return the exports for a valid, single declaration object export', async () => {
      const relpath = './lib/main.d.ts';
      const abspath = path.join(packageRoot, relpath);
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
      vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
        JSON.stringify({ ...PACKAGE_STUB, exports: { '.': { types: relpath } } })
      );
      await expect(resolver.resolve(PACKAGE_STUB.name)).resolves.toMatchObject({
        exports: {
          '.': {
            types: abspath
          }
        }
      });
    });
    it('should return the exports for a valid object export with declarations and source', async () => {
      const declaration = {
        get abspath() {
          return path.join(packageRoot, this.relpath);
        },
        relpath: './dist/index.d.ts'
      };
      const source = {
        get abspath() {
          return path.join(packageRoot, this.relpath);
        },
        relpath: './dist/index.js'
      };
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
      vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
        JSON.stringify({ ...PACKAGE_STUB, exports: { '.': { import: source.relpath, types: declaration.relpath } } })
      );
      await expect(resolver.resolve(PACKAGE_STUB.name)).resolves.toMatchObject({
        exports: {
          '.': {
            import: source.abspath,
            types: declaration.abspath
          }
        }
      });
    });
  });
});

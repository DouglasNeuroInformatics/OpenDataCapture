import { describe, expect, it, vi } from 'vitest';

const tree: { [key: string]: string[] } = {
  '/base': ['index.js', 'sub'],
  '/base/sub': ['page.html', 'styles.css', 'types.d.ts']
};

vi.mock('fs', () => ({
  existsSync: (path: string) => Object.hasOwn(tree, path),
  lstatSync: (path: string) => ({ isDirectory: () => Object.hasOwn(tree, path) }),
  promises: {
    readdir: (dir: string) => Promise.resolve(tree[dir] ?? []),
    readFile: (path: string) => Promise.resolve(`content:${path}`)
  }
}));

vi.mock('module', () => ({
  createRequire: () => ({
    resolve: (specifier: string) => `/fake-node-modules/${specifier}`
  })
}));

const { generateManifest, generateMetadata, MANIFEST_FILENAME, parsePackages, resolveRuntimeAsset } =
  await import('../index.js');

describe('generateManifest', () => {
  it('should group files under a directory into sources, styles, declarations and html by extension', async () => {
    await expect(generateManifest('/base')).resolves.toEqual({
      declarations: ['sub/types.d.ts'],
      html: ['sub/page.html'],
      sources: ['index.js'],
      styles: ['sub/styles.css']
    });
  });
});

describe('generateMetadata', () => {
  it("should resolve each runtime version's package directory and build its manifest and package list", async () => {
    const metadata = await generateMetadata({ rootDir: '/consumer' });
    const v1 = metadata.get('v1');
    expect(v1?.baseDir).toBe('/fake-node-modules/@opendatacapture/runtime-v1/dist');
    expect(v1?.manifest).toEqual({ declarations: [], html: [], sources: [], styles: [] });
    expect(v1?.packages).toEqual([]);
  });
});

describe('resolveRuntimeAsset', () => {
  const metadata = new Map([
    [
      'v1',
      {
        baseDir: '/base',
        manifest: {
          declarations: ['sub/types.d.ts'],
          html: ['sub/page.html'],
          sources: ['index.js'],
          styles: ['sub/styles.css']
        },
        packages: []
      }
    ]
  ]);

  it('should return null when the URL carries no version or no filepath', async () => {
    await expect(resolveRuntimeAsset('', metadata)).resolves.toBeNull();
    await expect(resolveRuntimeAsset('/v1', metadata)).resolves.toBeNull();
  });

  it('should return null when the version is not in the metadata map', async () => {
    await expect(resolveRuntimeAsset('/v2/index.js', metadata)).resolves.toBeNull();
  });

  it('should return the manifest itself as JSON', async () => {
    await expect(resolveRuntimeAsset(`/v1/${MANIFEST_FILENAME}`, metadata)).resolves.toEqual({
      content: JSON.stringify(metadata.get('v1')!.manifest),
      contentType: 'application/json'
    });
  });

  it('should read a declaration file as plain text', async () => {
    await expect(resolveRuntimeAsset('/v1/sub/types.d.ts', metadata)).resolves.toEqual({
      content: 'content:/base/sub/types.d.ts',
      contentType: 'text/plain'
    });
  });

  it('should read an html file as text/html', async () => {
    await expect(resolveRuntimeAsset('/v1/sub/page.html', metadata)).resolves.toEqual({
      content: 'content:/base/sub/page.html',
      contentType: 'text/html'
    });
  });

  it('should read a style as text/css', async () => {
    await expect(resolveRuntimeAsset('/v1/sub/styles.css', metadata)).resolves.toEqual({
      content: 'content:/base/sub/styles.css',
      contentType: 'text/css'
    });
  });

  it('should read a source as text/javascript', async () => {
    await expect(resolveRuntimeAsset('/v1/index.js', metadata)).resolves.toEqual({
      content: 'content:/base/index.js',
      contentType: 'text/javascript'
    });
  });

  it('should return null for a filepath the manifest does not list', async () => {
    await expect(resolveRuntimeAsset('/v1/missing.js', metadata)).resolves.toBeNull();
  });
});

describe('parsePackages', () => {
  it('groups files under the package parsed from their path', () => {
    const packages = parsePackages('v1', {
      html: [],
      sources: ['react@19.x/index.js', 'react@19.x/jsx-runtime.js'],
      styles: ['normalize.css@8.x/normalize.css']
    });
    expect(packages).toStrictEqual([
      {
        exports: {
          css: [],
          html: [],
          js: ['/runtime/v1/react@19.x/index.js', '/runtime/v1/react@19.x/jsx-runtime.js']
        },
        name: 'react',
        version: '19.x'
      },
      {
        exports: { css: ['/runtime/v1/normalize.css@8.x/normalize.css'], html: [], js: [] },
        name: 'normalize.css',
        version: '8.x'
      }
    ]);
  });

  it('omits underscore-prefixed bundler output from all packages', () => {
    const packages = parsePackages('v1', {
      html: [],
      sources: ['_chunks/ABCD1234.js', 'react@19.x/index.js'],
      styles: []
    });
    expect(packages.map((pkg) => pkg.name)).toStrictEqual(['react']);
  });

  it('throws when a source path does not match the import path pattern', () => {
    expect(() => parsePackages('v1', { html: [], sources: ['/leading-slash.js'], styles: [] })).toThrow(
      'Unexpected import path pattern'
    );
  });
});

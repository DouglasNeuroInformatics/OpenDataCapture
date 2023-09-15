import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import autoprefixer from 'autoprefixer';
import esbuild from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

const ROOT_DIR = path.resolve(import.meta.dir, '..');
const BUNDLE_FILE = path.resolve(ROOT_DIR, 'dist', 'main.js');

const isDir = async (filepath: string) => {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
};

const createBuildContext = () => {
  return esbuild.context({
    bundle: true,
    entryPoints: [path.resolve(import.meta.dir, 'static', 'main.tsx')],
    minify: true,
    outfile: BUNDLE_FILE,
    platform: 'browser',
    // plugins: [
    //   {
    //     name: 'postcss',
    //     setup: async (build) => {
    //       build.onResolve({ filter: /.\.css$/, namespace: 'file' }, async (args) => {
    //         const sourceFullPath = path.resolve(args.resolveDir, args.path);
    //         const sourceExt = path.extname(sourceFullPath);
    //         const sourceBaseName = path.basename(sourceFullPath, sourceExt);
    //         const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'odc-'));
    //         if (!(await isDir(tmpDir))) {
    //           await fs.mkdir(tmpDir);
    //         }

    //         const css = await Bun.file(sourceFullPath).text();
    //         const tmpFilePath = path.resolve(tmpDir, `${sourceBaseName}.css`);

    //         // @ts-expect-error - will fix tmr
    //         const result = await postcss([tailwindcss(), autoprefixer()]).process(css, {
    //           from: sourceFullPath,
    //           to: tmpFilePath
    //         });

    //         await fs.writeFile(tmpFilePath, result.css);

    //         return { path: tmpFilePath };
    //       });
    //     }
    //   }
    // ]
  });
};

export const build = async () => {
  const ctx = await createBuildContext();
  await ctx.watch();
};

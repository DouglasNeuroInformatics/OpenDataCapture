#!/usr/bin/env tsx

import * as fs from 'node:fs';
import * as path from 'node:path';

import { Command, InvalidArgumentError } from 'commander';
import { glob } from 'glob';

import { name, version } from '../package.json';
import { bundle } from './bundle.js';
import { inferLoader } from './utils.js';

import type { BundlerInput } from './schemas.js';

const program = new Command();
program.name(name);
program.version(version);
program.allowExcessArguments(false);
program.argument('<target>', 'the directory to search for instruments', (path: string) => {
  if (!fs.existsSync(path)) {
    throw new InvalidArgumentError('Directory does not exist');
  } else if (!fs.lstatSync(path).isDirectory()) {
    throw new InvalidArgumentError('Not a directory');
  }
  return path;
});
program.requiredOption('--outdir <path>', 'path to output directory');
program.option('--clean', 'delete the output directory before build');
program.option('--declaration', 'emit typescript declarations');
program.option('--raw', 'output raw bundle rather than as default export string');
program.option('--no-minify', 'disable minification');
program.option('--verbose', 'enable verbose mode');
program.parse();

const options = program.opts();

const logger = Object.create(console) as { verbose: (message: string) => void } & Console;
logger.verbose = (message: string) => {
  if (options.verbose) {
    console.log(message);
  }
};

let inputBase = program.args[0]!;
if (!path.isAbsolute(inputBase)) {
  inputBase = path.resolve(process.cwd(), inputBase);
}
logger.verbose(`Resolved input base: ${inputBase}`);

let outputBase = options.outdir as string;
if (!path.isAbsolute(outputBase)) {
  outputBase = path.resolve(process.cwd(), outputBase);
}
logger.verbose(`Resolved output base: ${outputBase}`);

if (options.clean) {
  logger.verbose(`Removing directory: ${outputBase}`);
  await fs.promises.rm(outputBase, { force: true, recursive: true });
}

const indexFiles = await glob(`${inputBase}/**/*/index.{js,jsx,ts,tsx}`);

const targetDirs = Array.from(new Set(indexFiles.map((filename) => path.dirname(filename))));

for (const targetDir of targetDirs) {
  logger.verbose(`Searching for entry in target directory: ${targetDir}`);
  const inputFiles = await glob(`${targetDir}/*`);

  if (inputFiles.length === 0) {
    logger.warn(`Failed to find any input files in directory: ${targetDir}`);
    continue;
  }

  const inputs: BundlerInput[] = await Promise.all(
    inputFiles.map(async (filepath) => {
      const loader = inferLoader(filepath);
      return {
        content: await fs.promises.readFile(filepath, loader === 'dataurl' ? null : 'utf-8'),
        name: path.basename(filepath)
      };
    })
  );

  logger.verbose(`Found input files: ${inputs.map((input) => `'${input.name}'`).join(', ')}`);

  const outputBundlePath = `${targetDir.replace(inputBase, outputBase)}.js`;
  const outputDir = path.dirname(outputBundlePath);

  if (!fs.existsSync(outputDir)) {
    logger.verbose(`Creating directory: ${outputDir}`);
    await fs.promises.mkdir(outputDir, { recursive: true });
  }

  logger.verbose('Generating bundle...');

  const output = await bundle({ inputs, minify: !options.minify === false });

  logger.verbose(`Writing output bundle to file: ${outputBundlePath}`);

  if (options.raw) {
    await fs.promises.writeFile(outputBundlePath, output, 'utf-8');
  } else {
    await fs.promises.writeFile(outputBundlePath, `export default ${JSON.stringify(output)}`, 'utf-8');
  }

  if (options.declaration) {
    const declarationOutfile = outputBundlePath.replace(/\.js$/i, '.d.ts');
    const declarationContent = ['declare const bundle: string;', 'export default bundle;', ''].join('\n');
    logger.verbose(`Writing output declaration file: ${declarationOutfile}`);
    await fs.promises.writeFile(declarationOutfile, declarationContent, 'utf-8');
  }
}

logger.log('Done!');

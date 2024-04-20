#!/usr/bin/env tsx

import * as fs from 'node:fs';
import * as path from 'node:path';

import { Command, InvalidArgumentError } from 'commander';
import { glob } from 'glob';

import { name, version } from '../package.json';
import { InstrumentBundler } from './index.js';

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
program.option('--clean', 'delete the output directory before build');
program.option('--declaration', 'emit typescript declarations');
program.option('--outdir <path>', 'path to output directory');
program.option('--verbose', 'enable verbose mode');
program.parse();

const options = program.opts();

let inputBase = program.args[0];
if (!path.isAbsolute(inputBase)) {
  inputBase = path.resolve(process.cwd(), inputBase);
}

let outputBase = options.outdir as string;
if (!path.isAbsolute(outputBase)) {
  outputBase = path.resolve(process.cwd(), outputBase);
}

const logger = Object.create(console) as { verbose: (message: string) => void } & Console;
logger.verbose = (message: string) => {
  if (options.verbose) {
    console.log(message);
  }
};

if (options.clean) {
  logger.verbose(`Removing directory: ${outputBase}`);
  await fs.promises.rm(outputBase, { force: true, recursive: true });
}

const inputs = await glob(`${inputBase}/**/*.{js,jsx,ts,tsx}`);

const bundler = new InstrumentBundler();

for (const input of inputs) {
  logger.verbose(`Bundling input file: ${input}`);
  const source = await fs.promises.readFile(input, 'utf-8');
  const outputs = await bundler.generateBundleFiles(source);
  const outfile = input.replace(/\.(js|ts|tsx|jsx)$/i, '.js').replace(inputBase, outputBase);
  const dirname = path.dirname(outfile);
  if (!fs.existsSync(dirname)) {
    logger.verbose(`Creating directory: ${dirname}`);
    await fs.promises.mkdir(dirname, { recursive: true });
  }
  logger.verbose(`Writing output source file: ${outfile}`);
  await fs.promises.writeFile(outfile, outputs.source, 'utf-8');

  if (options.declaration) {
    const declarationOutfile = outfile.replace(/\.js$/i, '.d.ts');
    logger.verbose(`Writing output declaration file: ${declarationOutfile}`);
    await fs.promises.writeFile(declarationOutfile, outputs.declaration, 'utf-8');
  }
}

logger.log('Done!');

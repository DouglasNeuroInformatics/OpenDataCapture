import * as fs from 'node:fs';
import * as path from 'node:path';

import { Command, InvalidArgumentError } from 'commander';

import { name, version } from '../package.json';
import { Server } from './server';

function parseTarget(target: string, all: boolean): string {
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    throw new InvalidArgumentError('Directory does not exist');
  }
  if (!fs.lstatSync(resolved).isDirectory()) {
    throw new InvalidArgumentError('Not a directory');
  }
  if (all) {
    const hasFormsDir = fs.existsSync(path.join(resolved, 'forms'));
    const hasInteractiveDir = fs.existsSync(path.join(resolved, 'interactive'));
    if (!hasFormsDir && !hasInteractiveDir) {
      throw new InvalidArgumentError('In --all mode, directory must contain a forms/ and/or interactive/ subdirectory');
    }
  }
  return resolved;
}

function parsePort(value: string): number {
  const port = parseInt(value, 10);
  if (Number.isNaN(port)) {
    throw new InvalidArgumentError(`Not a number: ${value}`);
  }
  return port;
}

const program = new Command();

program
  .name(name)
  .version(version)
  .allowExcessArguments(false)
  .argument('<target>', 'the directory containing the instrument')
  .option('-a, --all', 'serve all instruments from forms/ and interactive/ subdirectories')
  .option('-p --port <number>', 'the port to run the dev server on', parsePort, 3000)
  .option('-v, --verbose', 'enable verbose logging (includes request logs and build timing)')
  .action(async (target: string) => {
    const { all, port, verbose } = program.opts<{ all: boolean; port: number; verbose: boolean }>();
    const resolved = parseTarget(target, all);
    const server = await Server.create({
      mode: all ? 'all' : 'single',
      port,
      target: resolved,
      verbose: verbose ?? false
    });
    await server.start();
  });

program.parse();

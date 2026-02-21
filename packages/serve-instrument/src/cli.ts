import * as fs from 'node:fs';
import * as path from 'node:path';

import { Command, InvalidArgumentError } from 'commander';

import { name, version } from '../package.json';
import { Server } from './server';

function parseTarget(target: string): string {
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    throw new InvalidArgumentError('Directory does not exist');
  }
  if (!fs.lstatSync(resolved).isDirectory()) {
    throw new InvalidArgumentError('Not a directory');
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
  .argument('<target>', 'the directory containing the instrument', parseTarget)
  .option('-p --port <number>', 'the port to run the dev server on', parsePort, 3000)
  .option('-v, --verbose', 'enable verbose logging (includes request logs and build timing)')
  .action(async (target: string) => {
    const { port, verbose } = program.opts<{ port: number; verbose: boolean }>();
    const server = await Server.create({ port, target, verbose: verbose ?? false });
    await server.start();
  });

program.parse();

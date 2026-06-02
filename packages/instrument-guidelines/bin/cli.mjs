#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(packageRoot, 'AGENTS.md');

const HELP = `Usage: instrument-guidelines [options]

Links the Open Data Capture instrument-authoring guidelines into the current
directory so an agent (e.g. Claude Code) can read them.

Options:
  --file <name>   Target filename to create (default: AGENTS.md). Repeatable,
                  e.g. --file AGENTS.md --file CLAUDE.md to create both.
  --copy          Copy the guidelines instead of symlinking them.
  --force         Overwrite existing target file(s).
  -h, --help      Show this help.
`;

function fail(message) {
  process.stderr.write(`error: ${message}\n`);
  process.exit(1);
}

let parsed;
try {
  parsed = parseArgs({
    options: {
      copy: { default: false, type: 'boolean' },
      file: { multiple: true, type: 'string' },
      force: { default: false, type: 'boolean' },
      help: { default: false, short: 'h', type: 'boolean' }
    }
  });
} catch (err) {
  fail(err.message);
}

const { copy, file, force, help } = parsed.values;

if (help) {
  process.stdout.write(HELP);
  process.exit(0);
}

if (!fs.existsSync(source)) {
  fail(`could not find guidelines at ${source}`);
}

const targets = file && file.length > 0 ? file : ['AGENTS.md'];
const cwd = process.cwd();

for (const name of targets) {
  const target = path.resolve(cwd, name);

  if (fs.lstatSync(target, { throwIfNoEntry: false })) {
    if (!force) {
      process.stdout.write(`skipped ${name} (already exists; pass --force to overwrite)\n`);
      continue;
    }
    fs.rmSync(target, { force: true });
  }

  if (copy) {
    fs.copyFileSync(source, target);
    process.stdout.write(`copied ${name}\n`);
    continue;
  }

  const linkTarget = path.relative(path.dirname(target), source);
  try {
    fs.symlinkSync(linkTarget, target);
    process.stdout.write(`linked ${name} -> ${linkTarget}\n`);
  } catch (err) {
    if (err.code === 'EPERM') {
      fail(`cannot create symlink (${err.code}); re-run with --copy instead`);
    }
    fail(err.message);
  }
}

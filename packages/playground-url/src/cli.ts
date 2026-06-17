import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

import chalk from 'chalk';
import { Command, InvalidArgumentError } from 'commander';

import { name, version } from '../package.json';
import { DEFAULT_PLAYGROUND_URL, encodeShareURL } from './share-url.js';

import type { EditorFile } from './models.js';

/** Text files the playground can load from a share URL. */
const TEXT_FILE_EXT_REGEX = /\.(css|html|js|jsx|json|ts|tsx)$/i;
/** Bundler assets that exist on disk but cannot be embedded in a (string-only) share URL. */
const BINARY_FILE_EXT_REGEX = /\.(jpeg|jpg|mp3|mp4|png|svg|webp)$/i;

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

function parseBaseURL(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    throw new InvalidArgumentError(`Not a valid URL: ${value}`);
  }
}

/** Read every URL-shareable text file directly within `target`, warning about skipped assets. */
function readInstrumentFiles(target: string): EditorFile[] {
  const files: EditorFile[] = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }
    const filepath = path.join(target, entry.name);
    if (TEXT_FILE_EXT_REGEX.test(entry.name)) {
      files.push({ content: fs.readFileSync(filepath, 'utf-8'), name: entry.name });
    } else if (BINARY_FILE_EXT_REGEX.test(entry.name)) {
      process.stderr.write(
        chalk.yellow(`⚠ Skipping '${entry.name}': binary assets cannot be embedded in a share URL\n`)
      );
    }
  }
  return files;
}

/** Open a URL in the user's default browser, cross-platform, without extra dependencies. */
function openInBrowser(url: string): void {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(command, [url], { detached: true, shell: process.platform === 'win32', stdio: 'ignore' }).unref();
}

const program = new Command();

program
  .name(name)
  .description('Generate an Open Data Capture playground link from an instrument directory')
  .version(version)
  .allowExcessArguments(false)
  .argument('<target>', 'the directory containing the instrument source files', parseTarget)
  .option('-l, --label <label>', 'the label for the shared instrument (defaults to the directory name)')
  .option('-f, --fullscreen', 'share a read-only fullscreen preview rather than the editor')
  .option('-b, --base-url <url>', 'the playground origin to link to', parseBaseURL, DEFAULT_PLAYGROUND_URL)
  .option('-o, --open', 'open the generated link in your default browser')
  .action((target: string) => {
    const { baseUrl, fullscreen, label, open } = program.opts<{
      baseUrl: string;
      fullscreen?: boolean;
      label?: string;
      open?: boolean;
    }>();

    const files = readInstrumentFiles(target);
    if (files.length === 0) {
      process.stderr.write(chalk.red(`✘ No shareable source files found in ${target}\n`));
      process.exitCode = 1;
      return;
    }

    const shareURL = encodeShareURL({
      baseURL: baseUrl,
      files,
      fullscreen,
      label: label ?? path.basename(target)
    });

    // Status goes to stderr so the URL on stdout stays clean and pipeable.
    process.stderr.write(
      chalk.green('✓') +
        chalk.dim(` Encoded ${files.length} file${files.length === 1 ? '' : 's'} (${shareURL.size} bytes)\n`)
    );
    process.stdout.write(shareURL.href + '\n');

    if (open) {
      openInBrowser(shareURL.href);
    }
  });

program.parse();

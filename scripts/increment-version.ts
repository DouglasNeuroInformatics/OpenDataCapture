#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { parseArgs, styleText } from 'node:util';

// The menu offers the bumps in this order, so they live in a tuple: perfectionist/sort-objects
// alphabetizes object literals and would silently reorder the prompt.
const BUMPS = ['major', 'minor', 'patch'] as const;

type Bump = (typeof BUMPS)[number];

type Options = {
  bump: Bump | null;
  commit: boolean;
  help: boolean;
  yes: boolean;
};

type PackageFile = {
  absolutePath: string;
  relativePath: string;
};

type Plan = {
  commit: boolean;
  newVersion: string;
};

type Prompt = {
  ask: (prompt: string) => Promise<null | string>;
  close: () => void;
};

type Streams = {
  stderr: 'capture' | 'inherit';
  stdout: 'capture' | 'inherit';
};

// scripts/changelog.ts writes these; they are committed alongside the version files.
const CHANGELOG_FILES = ['CHANGELOG.md', 'docs/en/6-changelog/changelog.md'];

const USAGE = `Usage: ./scripts/increment-version.ts [options]

Sets the root package.json and every publishable package to one new version, writes that
version's section of CHANGELOG.md, and optionally commits the result.

Options:
  -b, --bump <major|minor|patch>  Take the bump from the command line instead of prompting
  -y, --yes                       Answer every prompt with its default and skip the confirmation
  -c, --commit                    Answer the commit prompt yes, without asking
  -h, --help                      Show this message
`;

const projectRoot = path.resolve(import.meta.dirname, '..');
const rootPackageJson = path.join(projectRoot, 'package.json');

function isBump(value: unknown): value is Bump {
  return typeof value === 'string' && (BUMPS as readonly string[]).includes(value);
}

function print(line?: string): void {
  process.stdout.write(line === undefined ? '\n' : `  ${line}\n`);
}

function run(command: string, args: string[], streams: Streams): string {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: [
      'ignore',
      streams.stdout === 'capture' ? 'pipe' : 'inherit',
      streams.stderr === 'capture' ? 'pipe' : 'inherit'
    ]
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command failed with status ${result.status}: ${command} ${args.join(' ')}`);
  }
  return streams.stdout === 'capture' ? result.stdout : '';
}

function readVersion(absolutePath: string): string {
  const contents: unknown = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  if (typeof contents !== 'object' || contents === null || !('version' in contents)) {
    throw new Error(`Expected a version field in ${absolutePath}`);
  }
  const { version } = contents;
  if (typeof version !== 'string') {
    throw new Error(`Expected a string version field in ${absolutePath}`);
  }
  return version;
}

function writeVersion(absolutePath: string, version: string): void {
  // A textual rewrite rather than a JSON round-trip: JSON.stringify would reformat the whole
  // file, so every bump would arrive as a diff nobody can review.
  const versionField = /("version":\s*)"[^"]*"/;
  const contents = fs.readFileSync(absolutePath, 'utf8');
  if (!versionField.test(contents)) {
    throw new Error(`No version field to update in ${absolutePath}`);
  }
  fs.writeFileSync(absolutePath, contents.replace(versionField, `$1"${version}"`));
}

// The root package (private, so list-publishable.sh never returns it) plus every package
// discovered through its publishConfig marker. Adding a publishable package needs no edit here.
function collectPackageFiles(): PackageFile[] {
  const listed = run(path.join(projectRoot, 'scripts', 'list-publishable.sh'), [], {
    stderr: 'inherit',
    stdout: 'capture'
  });
  const publishable = listed
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const [, , absolutePath] = line.split('\t');
      if (!absolutePath) {
        throw new Error(`Expected a tab-separated line from list-publishable.sh, got '${line}'`);
      }
      return absolutePath;
    });
  return [rootPackageJson, ...publishable].map((absolutePath) => ({
    absolutePath,
    relativePath: path.relative(projectRoot, absolutePath)
  }));
}

function bumpVersion(current: string, bump: Bump): string {
  const parsed = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!parsed) {
    throw new Error(`Expected a version such as 2.3.0 in package.json, got '${current}'`);
  }
  const [major, minor, patch] = parsed.slice(1).map(Number) as [number, number, number];
  switch (bump) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

// changelog.ts reports the recommendation on stdout for this script and explains it on stderr
// for the reader, where it also warns about commits it had to skip. Both belong on screen.
function recommendBump(): Bump {
  const result = spawnSync('pnpm', ['exec', 'tsx', 'scripts/changelog.ts', 'recommend'], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    throw new Error('Failed to read the recommended bump from scripts/changelog.ts');
  }
  for (const line of result.stderr.split('\n').filter((entry) => entry.trim())) {
    print(line.startsWith('Warning:') ? styleText('yellow', `! ${line}`) : styleText('dim', line));
  }
  const recommended = result.stdout.trim();
  if (!isBump(recommended)) {
    throw new Error(`Expected one of ${BUMPS.join(', ')} from scripts/changelog.ts, got '${recommended}'`);
  }
  return recommended;
}

function renderMenu(currentVersion: string, recommended: Bump): void {
  print();
  print(styleText('bold', 'Select a version bump'));
  print();
  BUMPS.forEach((bump, index) => {
    const isRecommended = bump === recommended;
    const marker = isRecommended ? styleText('green', '❯') : ' ';
    const suffix = isRecommended ? styleText('green', ' recommended') : '';
    // Pad before styling: the escape sequences styleText adds are invisible but not free-width.
    const version = styleText('cyan', bumpVersion(currentVersion, bump).padEnd(9));
    print(`${marker} ${index + 1}  ${bump.padEnd(7)}${version}${suffix}`);
  });
  print(`  ${BUMPS.length + 1}  quit`);
  print();
}

// Ctrl+D closes stdin, which rejects the pending question. That is the reader walking away, so it
// answers null and every caller treats null as an abort; a rejection with the interface still open
// is a real failure and is rethrown.
function createPrompt(): Prompt {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let closed = false;
  rl.on('close', () => {
    closed = true;
  });
  return {
    ask: async (prompt: string) => {
      try {
        return (await rl.question(`  ${prompt}`)).trim();
      } catch (error) {
        if (!closed) {
          throw error;
        }
        process.stdout.write('\n');
        return null;
      }
    },
    close: () => {
      rl.close();
    }
  };
}

async function askBump(prompt: Prompt, currentVersion: string, recommended: Bump): Promise<Bump | null> {
  renderMenu(currentVersion, recommended);
  const choices: ('quit' | Bump)[] = [...BUMPS, 'quit'];
  const defaultChoice = String(BUMPS.indexOf(recommended) + 1);
  for (;;) {
    const input = await prompt.ask(`Selection [${defaultChoice}]: `);
    if (input === null) {
      return null;
    }
    const answer = input || defaultChoice;
    const selected = choices.find((choice, index) => answer === choice || answer === String(index + 1));
    if (selected === 'quit') {
      return null;
    } else if (selected) {
      return selected;
    }
    print(styleText('red', `Invalid selection: '${answer}'. Enter 1-${choices.length}.`));
  }
}

async function askConfirmation(prompt: Prompt, question: string): Promise<boolean> {
  const answer = await prompt.ask(`${question} ${styleText('dim', '[y/N]')} `);
  return answer !== null && /^y(es)?$/i.test(answer);
}

function commitRelease(files: string[], version: string): void {
  // Explicit pathspecs, so anything else already staged stays staged rather than riding along.
  const unchanged = files.filter(
    (file) =>
      !run('git', ['diff', '--name-only', 'HEAD', '--', file], {
        stderr: 'inherit',
        stdout: 'capture'
      }).trim()
  );
  if (unchanged.length > 0) {
    throw new Error(`Refusing to commit: these files were not modified by the bump: ${unchanged.join(', ')}`);
  }
  run('git', ['commit', '--message', `chore: release v${version}`, '--', ...files], {
    stderr: 'inherit',
    stdout: 'inherit'
  });
}

function parseBumpOption(value: string | undefined): Bump | null {
  if (value === undefined) {
    return null;
  }
  if (!isBump(value)) {
    throw new Error(`Expected --bump to be one of ${BUMPS.join(', ')}, got '${value}'`);
  }
  return value;
}

function parseOptions(argv: string[]): Options {
  const { values } = parseArgs({
    args: argv,
    options: {
      bump: { short: 'b', type: 'string' },
      commit: { short: 'c', type: 'boolean' },
      help: { short: 'h', type: 'boolean' },
      yes: { short: 'y', type: 'boolean' }
    }
  });
  return {
    bump: parseBumpOption(values.bump),
    commit: values.commit ?? false,
    help: values.help ?? false,
    yes: values.yes ?? false
  };
}

function requireTty(flag: string): void {
  if (!process.stdin.isTTY) {
    throw new Error(`Cannot prompt when stdin is not a terminal — pass ${flag} to run without the prompt`);
  }
}

// Both answers can arrive as flags, which is what makes a run without a terminal possible: --commit
// answers the commit prompt, --yes answers the rest with their defaults, and the commit default is no.
async function planRelease(options: Options, currentVersion: string): Promise<null | Plan> {
  const prompt = createPrompt();
  try {
    const bump = options.bump ?? (await askBump(prompt, currentVersion, recommendBump()));
    if (!bump) {
      return null;
    }
    const newVersion = bumpVersion(currentVersion, bump);
    const message = `"chore: release v${newVersion}"`;
    const commit =
      options.commit || (!options.yes && (await askConfirmation(prompt, `Commit the result as ${message}?`)));
    const action = commit
      ? `Bump ${currentVersion} → ${newVersion} and commit as ${message}?`
      : `Bump ${currentVersion} → ${newVersion}?`;
    if (!options.yes && !(await askConfirmation(prompt, action))) {
      return null;
    }
    return { commit, newVersion };
  } finally {
    prompt.close();
  }
}

async function main(argv: string[]): Promise<void> {
  const options = parseOptions(argv);
  if (options.help) {
    process.stdout.write(USAGE);
    return;
  }

  const packageFiles = collectPackageFiles();
  const currentVersion = readVersion(rootPackageJson);

  print();
  print(styleText('bold', 'Open Data Capture · version bump'));
  print();
  print(`${styleText('dim', 'Current version')}  ${styleText('cyan', currentVersion)}`);
  print(`${styleText('dim', 'Packages')}         ${packageFiles.length}`);
  print();

  if (!options.bump) {
    requireTty('--bump <major|minor|patch>');
  }
  if (!options.yes) {
    requireTty('--yes');
  }

  const plan = await planRelease(options, currentVersion);
  if (!plan) {
    print(styleText('dim', 'Aborted.'));
    return;
  }
  const { commit, newVersion } = plan;

  print();
  for (const file of packageFiles) {
    writeVersion(file.absolutePath, newVersion);
    print(`${styleText('green', '✓')} ${file.relativePath} ${styleText('dim', `→ ${newVersion}`)}`);
  }
  print();

  run('pnpm', ['exec', 'tsx', 'scripts/changelog.ts', 'write', newVersion], {
    stderr: 'inherit',
    stdout: 'inherit'
  });

  // What the release workflow needs and nothing checks: a root bump that left the packages
  // behind publishes nothing while reporting success.
  const behind = packageFiles.filter((file) => readVersion(file.absolutePath) !== newVersion);
  if (behind.length > 0) {
    throw new Error(`These files do not report ${newVersion}: ${behind.map((file) => file.relativePath).join(', ')}`);
  }
  print();
  print(`${styleText('green', '✓')} All ${packageFiles.length} packages report ${styleText('cyan', newVersion)}`);

  if (commit) {
    commitRelease([...packageFiles.map((file) => file.relativePath), ...CHANGELOG_FILES], newVersion);
    print(`${styleText('green', '✓')} Committed as ${styleText('bold', `chore: release v${newVersion}`)}`);
    print();
    print(styleText('dim', 'Next: review the commit, then open a pull request against main.'));
  } else {
    print();
    print(`Next: review CHANGELOG.md, then commit as: ${styleText('bold', `chore: release v${newVersion}`)}`);
    print(styleText('dim', 'Pass --commit to have this script make that commit for you.'));
  }
  print();
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${styleText('red', '✖ Error:', { stream: process.stderr })} ${message}\n`);
  process.exit(1);
});

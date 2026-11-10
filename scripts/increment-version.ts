#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { parseArgs, styleText } from 'node:util';

import { format } from 'prettier';

import release from '../.github/scripts/release.cjs';

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

type FileEdit = {
  contents: string;
  relativePath: string;
  summary: string;
};

type Plan = {
  base: string;
  bump: Bump;
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

// A major bump rewrites these too: the channel a fresh .env tracks, and the end-of-support table.
const ENV_TEMPLATE_FILE = '.env.template';
const SUPPORT_POLICY_FILE = 'docs/en/5-reference/5.10-versioning.md';

const SUPPORT_TABLE_START = '<!-- support-table:start -->';
const SUPPORT_TABLE_END = '<!-- support-table:end -->';

// A superseded major stays supported for this long after its successor's release.
const SUPPORT_WINDOW_MONTHS = 18;

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

function parseVersion(version: string): readonly [number, number, number] {
  const parsed = release.parseVersion(version);
  if (!parsed) {
    throw new Error(`Expected a version such as 2.3.0 in package.json, got '${version}'`);
  }
  return parsed;
}

function bumpVersion(current: string, bump: Bump): string {
  const [major, minor, patch] = parseVersion(current);
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

// A breaking commit makes the next release from main a major. A superseded major, released from its
// release/<major> branch, takes fixes only (docs/en/5-reference/5.10-versioning.md), so its next
// version is a patch and a breaking or feat commit in range is refused outright.
function allowBumps(
  currentVersion: string,
  recommended: Bump,
  requested: Bump | null
): { base: string; bumps: readonly Bump[] } {
  const [major] = parseVersion(currentVersion);
  const restrict = (base: string, bump: Bump, rule: string) => {
    if (requested && requested !== bump) {
      throw new Error(`Refusing --bump ${requested}: ${rule}`);
    }
    return { base, bumps: [bump] };
  };
  const tags = run('git', ['tag', '--list', 'v*'], { stderr: 'inherit', stdout: 'capture' });
  if (release.isSupersededMajor(major, tags.split('\n').filter(Boolean))) {
    if (recommended !== 'patch') {
      const commit = recommended === 'major' ? 'breaking' : 'feat';
      throw new Error(`A ${commit} commit is in range, but ${major}.x is a superseded major, which takes fixes only`);
    }
    return restrict(`release/${major}`, 'patch', `${major}.x is a superseded major, which takes fixes only`);
  }
  if (recommended === 'major') {
    return restrict('main', 'major', 'a breaking commit is in range, so the bump must be major');
  }
  return { base: 'main', bumps: BUMPS };
}

function renderMenu(currentVersion: string, bumps: readonly Bump[], recommended: Bump): void {
  print();
  print(styleText('bold', 'Select a version bump'));
  print();
  bumps.forEach((bump, index) => {
    const isRecommended = bump === recommended;
    const marker = isRecommended ? styleText('green', '❯') : ' ';
    const suffix = isRecommended ? styleText('green', ' recommended') : '';
    // Pad before styling: the escape sequences styleText adds are invisible but not free-width.
    const version = styleText('cyan', bumpVersion(currentVersion, bump).padEnd(9));
    print(`${marker} ${index + 1}  ${bump.padEnd(7)}${version}${suffix}`);
  });
  print(`  ${bumps.length + 1}  quit`);
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

async function askBump(
  prompt: Prompt,
  currentVersion: string,
  bumps: readonly Bump[],
  recommended: Bump
): Promise<Bump | null> {
  renderMenu(currentVersion, bumps, recommended);
  const choices: ('quit' | Bump)[] = [...bumps, 'quit'];
  const defaultChoice = String(bumps.indexOf(recommended) + 1);
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

function editReleaseChannel(major: number): FileEdit {
  const channel = /^RELEASE_CHANNEL=.*$/m;
  const contents = fs.readFileSync(path.join(projectRoot, ENV_TEMPLATE_FILE), 'utf8');
  if (!channel.test(contents)) {
    throw new Error(`No RELEASE_CHANNEL to update in ${ENV_TEMPLATE_FILE}`);
  }
  return {
    contents: contents.replace(channel, `RELEASE_CHANNEL=${major}`),
    relativePath: ENV_TEMPLATE_FILE,
    summary: `RELEASE_CHANNEL=${major}`
  };
}

// Date normalizes an out-of-range month index, which is what carries the window across years.
function formatMonth(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function cellsOf(row: string): string[] {
  return row
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

// The bump month stands in for the release month: the release ships when the bump's PR merges.
async function editSupportTable(previousMajor: number, newMajor: number): Promise<FileEdit> {
  const absolutePath = path.join(projectRoot, SUPPORT_POLICY_FILE);
  const contents = fs.readFileSync(absolutePath, 'utf8');
  const start = contents.indexOf(SUPPORT_TABLE_START);
  const end = contents.indexOf(SUPPORT_TABLE_END);
  if (start === -1 || end < start) {
    throw new Error(`No table between ${SUPPORT_TABLE_START} and ${SUPPORT_TABLE_END} in ${SUPPORT_POLICY_FILE}`);
  }
  const [header, separator, ...rows] = contents
    .slice(start + SUPPORT_TABLE_START.length, end)
    .trim()
    .split('\n');
  const index = rows.findIndex((row) => cellsOf(row)[0] === String(previousMajor));
  const previousRow = rows[index];
  const previousReleased = previousRow && cellsOf(previousRow)[1];
  if (!header || !separator || !previousReleased) {
    throw new Error(`The support table in ${SUPPORT_POLICY_FILE} has no row for ${previousMajor}`);
  }
  const now = new Date();
  const released = formatMonth(now.getFullYear(), now.getMonth());
  const supportedUntil = formatMonth(now.getFullYear(), now.getMonth() + SUPPORT_WINDOW_MONTHS);
  rows[index] = `| ${previousMajor} | ${previousReleased} | ${released} | ${supportedUntil} |`;
  const table = [header, separator, `| ${newMajor} | ${released} | — | — |`, ...rows].join('\n');
  const updated = `${contents.slice(0, start + SUPPORT_TABLE_START.length)}\n\n${table}\n\n${contents.slice(end)}`;
  return {
    contents: await format(updated, { filepath: absolutePath }),
    relativePath: SUPPORT_POLICY_FILE,
    summary: `${previousMajor}.x supported until ${supportedUntil}`
  };
}

// Computed before any version field is written, so a missing RELEASE_CHANNEL line or table row
// fails the run with the tree untouched rather than half-bumped.
async function editsForNewMajor(currentVersion: string, newVersion: string): Promise<FileEdit[]> {
  const [previousMajor] = parseVersion(currentVersion);
  const [newMajor] = parseVersion(newVersion);
  return [editReleaseChannel(newMajor), await editSupportTable(previousMajor, newMajor)];
}

function commitRelease(files: string[], version: string): void {
  // Explicit pathspecs, so anything else already staged stays staged rather than riding along.
  const unchanged = files.filter((file) => {
    return !run('git', ['diff', '--name-only', 'HEAD', '--', file], {
      stderr: 'inherit',
      stdout: 'capture'
    }).trim();
  });
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
  const recommended = recommendBump();
  const { base, bumps } = allowBumps(currentVersion, recommended, options.bump);
  const prompt = createPrompt();
  try {
    const bump = options.bump ?? (await askBump(prompt, currentVersion, bumps, recommended));
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
    return { base, bump, commit, newVersion };
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
  const { base, bump, commit, newVersion } = plan;
  const majorEdits = bump === 'major' ? await editsForNewMajor(currentVersion, newVersion) : [];

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

  for (const edit of majorEdits) {
    fs.writeFileSync(path.join(projectRoot, edit.relativePath), edit.contents);
    print(`${styleText('green', '✓')} ${edit.relativePath} ${styleText('dim', `→ ${edit.summary}`)}`);
  }

  if (commit) {
    const majorFiles = majorEdits.map((edit) => edit.relativePath);
    commitRelease([...packageFiles.map((file) => file.relativePath), ...CHANGELOG_FILES, ...majorFiles], newVersion);
    print(`${styleText('green', '✓')} Committed as ${styleText('bold', `chore: release v${newVersion}`)}`);
    print();
    print(styleText('dim', `Next: review the commit, then open a pull request against ${base}.`));
  } else {
    print();
    print(`Next: review CHANGELOG.md, then commit as: ${styleText('bold', `chore: release v${newVersion}`)}`);
    print(styleText('dim', `Then open a pull request against ${base}.`));
    print(styleText('dim', 'Pass --commit to have this script make that commit for you.'));
  }
  print();
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${styleText('red', '✖ Error:', { stream: process.stderr })} ${message}\n`);
  process.exit(1);
});

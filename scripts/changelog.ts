import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { CommitParser } from 'conventional-commits-parser';
import { format } from 'prettier';

type Bump = 'major' | 'minor' | 'patch';

type Commit = {
  breakingChanges: string[];
  hash: string;
  revertedHash: null | string;
  scope: null | string;
  subject: string;
  type: string;
};

type Section = {
  entries: string[];
  title: string;
};

const REPOSITORY_URL = 'https://github.com/DouglasNeuroinformatics/OpenDataCapture';

const projectRoot = path.resolve(import.meta.dirname, '..');
const changelogPath = path.join(projectRoot, 'CHANGELOG.md');
const docsCopyPath = path.join(projectRoot, 'docs', 'en', '6-changelog', 'changelog.md');

const changelogHeading = '# Changelog\n';
const docsFrontmatter = ['---', 'title: Changelog', 'slug: en/docs/changelog', '---', ''].join('\n');

// The header and revert patterns are those of the conventionalcommits preset that commitlint
// validates against, so a commit the gate accepts is a commit the generator can read.
const parser = new CommitParser({
  breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/,
  headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
  revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i
});

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8' });
}

function lastReleaseTag(): string {
  try {
    return git('describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*').trim();
  } catch {
    throw new Error('No release tag is reachable from HEAD. Fetch the tags before generating the changelog.');
  }
}

function parseCommit(raw: string): Commit | null {
  const [hash = '', ...messageLines] = raw.split('\n');
  const parsed = parser.parse(messageLines.join('\n'));
  if (!parsed.type || !parsed.subject) {
    return null;
  }
  return {
    breakingChanges: parsed.notes.map((note) => note.text),
    hash,
    revertedHash: parsed.revert?.hash ?? null,
    scope: parsed.scope ?? null,
    subject: parsed.subject,
    type: parsed.type
  };
}

function readCommitsSince(tag: string): Commit[] {
  const log = git('log', '-z', '--no-merges', '--format=%H%n%B', `${tag}..HEAD`);
  const commits: Commit[] = [];
  for (const raw of log.split('\0').filter((entry) => entry.trim())) {
    const commit = parseCommit(raw);
    if (commit) {
      commits.push(commit);
    } else {
      console.warn(`Warning: skipping commit ${raw.slice(0, 7)} because its message does not follow the convention`);
    }
  }
  return withoutReverted(commits);
}

function withoutReverted(commits: Commit[]): Commit[] {
  const cancelled = new Set<string>();
  for (const revert of commits) {
    const target = commits.find((commit) => revert.revertedHash && commit.hash.startsWith(revert.revertedHash));
    if (target) {
      cancelled.add(target.hash);
      cancelled.add(revert.hash);
    }
  }
  return commits.filter((commit) => !cancelled.has(commit.hash));
}

function recommendBump(commits: Commit[]): Bump {
  if (commits.some((commit) => commit.breakingChanges.length > 0)) {
    return 'major';
  }
  if (commits.some((commit) => commit.type === 'feat')) {
    return 'minor';
  }
  return 'patch';
}

function formatEntry(commit: Commit, text: string): string {
  const link = `[${commit.hash.slice(0, 7)}](${REPOSITORY_URL}/commit/${commit.hash})`;
  const prefix = commit.scope ? `**${commit.scope}:** ` : '';
  return `- ${prefix}${text} (${link})`;
}

function buildSections(commits: Commit[]): Section[] {
  const entriesOfType = (type: string) =>
    commits.filter((commit) => commit.type === type).map((commit) => formatEntry(commit, commit.subject));
  const sections: Section[] = [
    {
      entries: commits.flatMap((commit) => commit.breakingChanges.map((text) => formatEntry(commit, text))),
      title: 'Breaking Changes'
    },
    { entries: entriesOfType('feat'), title: 'Features' },
    { entries: entriesOfType('fix'), title: 'Bug Fixes' },
    { entries: entriesOfType('perf'), title: 'Performance' }
  ];
  return sections.filter((section) => section.entries.length > 0);
}

function renderRelease(version: string, commits: Commit[]): string {
  const sections = buildSections(commits);
  const body =
    sections.length === 0
      ? ['This release contains no user-facing changes.']
      : sections.map((section) => [`### ${section.title}`, '', ...section.entries].join('\n'));
  return [`## ${version}`, ...body].join('\n\n') + '\n';
}

function insertRelease(changelog: string, version: string, release: string): string {
  if (changelog.includes(`\n## ${version}\n`)) {
    throw new Error(`CHANGELOG.md already has a section for ${version}`);
  }
  const firstReleaseIndex = changelog.indexOf('\n## ');
  if (firstReleaseIndex === -1) {
    return changelog.trimEnd() + '\n\n' + release;
  }
  return changelog.slice(0, firstReleaseIndex + 1) + release + '\n' + changelog.slice(firstReleaseIndex + 1);
}

function extractRelease(changelog: string, version: string): string {
  const start = changelog.indexOf(`\n## ${version}\n`);
  if (start === -1) {
    throw new Error(`CHANGELOG.md has no section for ${version}`);
  }
  const bodyStart = start + `\n## ${version}\n`.length;
  const nextReleaseIndex = changelog.indexOf('\n## ', bodyStart);
  return changelog.slice(bodyStart, nextReleaseIndex === -1 ? undefined : nextReleaseIndex + 1).trim() + '\n';
}

function toDocsCopy(changelog: string): string {
  if (!changelog.startsWith(changelogHeading)) {
    throw new Error(`CHANGELOG.md must start with '${changelogHeading.trim()}'`);
  }
  return docsFrontmatter + changelog.slice(changelogHeading.length);
}

async function writeFormatted(filePath: string, contents: string): Promise<void> {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, await format(contents, { filepath: filePath }));
}

async function write(version: string): Promise<void> {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Expected a version such as 2.3.0, got '${version}'`);
  }
  const tag = lastReleaseTag();
  const commits = readCommitsSince(tag);
  const changelog = insertRelease(fs.readFileSync(changelogPath, 'utf8'), version, renderRelease(version, commits));
  await writeFormatted(changelogPath, changelog);
  await writeFormatted(docsCopyPath, toDocsCopy(changelog));
  console.log(`Wrote the ${version} section (${commits.length} commits since ${tag}) to:`);
  console.log(`  ${path.relative(projectRoot, changelogPath)}`);
  console.log(`  ${path.relative(projectRoot, docsCopyPath)}`);
}

function recommend(): void {
  const tag = lastReleaseTag();
  const commits = readCommitsSince(tag);
  const bump = recommendBump(commits);
  console.error(`Recommended bump: ${bump} (${commits.length} commits since ${tag})`);
  console.log(bump);
}

function section(version: string): void {
  process.stdout.write(extractRelease(fs.readFileSync(changelogPath, 'utf8'), version));
}

async function main([command, argument]: string[]): Promise<void> {
  if (command === 'recommend' && argument === undefined) {
    recommend();
  } else if (command === 'write' && argument !== undefined) {
    await write(argument);
  } else if (command === 'section' && argument !== undefined) {
    section(argument);
  } else {
    throw new Error('Usage: changelog.ts recommend | write <version> | section <version>');
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

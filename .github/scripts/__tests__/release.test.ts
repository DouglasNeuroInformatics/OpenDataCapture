import fs from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import release from '../release.cjs';

const { planRelease } = release;

const MAIN = 'refs/heads/main';
const RELEASE_2 = 'refs/heads/release/2';

describe('planRelease', () => {
  it('should build edge without releasing when main carries a tagged version', () => {
    expect(planRelease({ ref: MAIN, tags: ['v2.5.2'], version: '2.5.2' })).toEqual({
      edge: true,
      latest: false,
      major: '2',
      release: false,
      version: '2.5.2'
    });
  });

  it('should release main as latest when its version is new and the highest', () => {
    expect(planRelease({ ref: MAIN, tags: ['v2.5.2'], version: '2.6.0' })).toEqual({
      edge: true,
      latest: true,
      major: '2',
      release: true,
      version: '2.6.0'
    });
  });

  it('should refuse a release from main below any tag, so latest never moves back', () => {
    expect(() => planRelease({ ref: MAIN, tags: ['v3.0.0'], version: '2.6.0' })).toThrow(
      '2.6.0 is older than v3.0.0; bump past it first'
    );
  });

  it('should release a superseded major from its branch without moving latest', () => {
    expect(planRelease({ ref: RELEASE_2, tags: ['v2.6.0', 'v3.0.0'], version: '2.6.1' })).toEqual({
      edge: false,
      latest: false,
      major: '2',
      release: true,
      version: '2.6.1'
    });
  });

  it('should refuse a release branch whose major is still the newest, so it cannot plan latest', () => {
    expect(() => planRelease({ ref: RELEASE_2, tags: ['v2.6.0', 'v3.0.0-rc.1'], version: '2.6.1' })).toThrow(
      'No major above 2 is tagged, so 2.x is still released from refs/heads/main'
    );
  });

  it('should refuse an untagged patch older than its line, so a retry cannot move the major tag back', () => {
    expect(() => planRelease({ ref: RELEASE_2, tags: ['v2.6.2', 'v3.0.0'], version: '2.6.1' })).toThrow(
      '2.6.1 is older than v2.6.2; bump past it first'
    );
  });

  it('should not count a two-digit major as part of a one-digit line', () => {
    expect(() => planRelease({ ref: RELEASE_2, tags: ['v20.0.0'], version: '2.6.1' })).not.toThrow();
  });

  it('should ignore tags that are not plain versions', () => {
    expect(planRelease({ ref: MAIN, tags: ['v9-beta', 'v9.0.0-rc.1', '9.0.0'], version: '2.6.0' })).toMatchObject({
      latest: true
    });
  });

  it('should refuse a release branch whose version is already tagged, so a dispatch without a bump fails', () => {
    expect(() => planRelease({ ref: RELEASE_2, tags: ['v2.6.1', 'v3.0.0'], version: '2.6.1' })).toThrow(
      'v2.6.1 is already released; bump the version on refs/heads/release/2 first'
    );
  });

  it('should refuse a version from another major on a release branch', () => {
    expect(() => planRelease({ ref: RELEASE_2, tags: ['v4.0.0'], version: '3.0.0' })).toThrow(
      'Version 3.0.0 does not belong on refs/heads/release/2'
    );
  });

  it('should refuse any other ref, so a feature branch cannot publish', () => {
    expect(() => planRelease({ ref: 'refs/heads/release/2.5', tags: [], version: '2.5.3' })).toThrow(
      'Releases are cut from refs/heads/main or refs/heads/release/<major>, not refs/heads/release/2.5'
    );
  });

  it('should refuse a version that cannot be an image tag', () => {
    expect(() => planRelease({ ref: MAIN, tags: [], version: '2.6.0-rc.1' })).toThrow(
      "The root package.json version '2.6.0-rc.1' is not <major>.<minor>.<patch>"
    );
  });
});

describe('release', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function run(ref: string, version: string, tags: string) {
    const readFileSync = vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ version }));
    const core = { notice: vi.fn(), setOutput: vi.fn() };
    const exec = { getExecOutput: vi.fn(() => Promise.resolve({ stdout: tags })) };
    return { core, done: release({ context: { ref }, core, exec }), exec, readFileSync };
  }

  it('should plan from the root package.json and every v* tag in the repository', async () => {
    const { done, exec, readFileSync } = run(MAIN, '2.6.0', 'v2.5.2\n');
    await done;
    expect(readFileSync).toHaveBeenCalledWith('package.json', 'utf-8');
    expect(exec.getExecOutput).toHaveBeenCalledWith('git', ['tag', '--list', 'v*']);
  });

  it('should expose the plan for the root version and the git tags as workflow outputs', async () => {
    const { core, done } = run(MAIN, '2.6.0', 'v2.5.1\nv2.5.2\n');
    await done;
    expect(Object.fromEntries(core.setOutput.mock.calls)).toEqual({
      edge: 'true',
      latest: 'true',
      major: '2',
      release: 'true',
      version: '2.6.0'
    });
    expect(core.notice).not.toHaveBeenCalled();
  });

  it('should say that a release of a superseded major skips npm, so the missing publish is not a surprise', async () => {
    const { core, done } = run(RELEASE_2, '2.6.1', 'v2.6.0\nv3.0.0\n');
    await done;
    expect(core.notice).toHaveBeenCalledWith(
      'Skipping npm: 2.6.1 releases the superseded 2 line, and npm publishes from main only'
    );
  });
});

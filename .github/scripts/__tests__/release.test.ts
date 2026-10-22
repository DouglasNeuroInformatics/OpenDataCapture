import fs from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';

import release from '../release.cjs';

const { planRelease } = release;

const MAIN = 'refs/heads/main';
const RELEASE_2_5 = 'refs/heads/release/2.5';

describe('planRelease', () => {
  it('should build edge without releasing when main carries a tagged version', () => {
    expect(planRelease({ ref: MAIN, tags: ['v2.5.2'], version: '2.5.2' })).toMatchObject({
      edge: true,
      latest: false,
      release: false
    });
  });

  it('should release main as latest when its version is new and the highest', () => {
    expect(planRelease({ ref: MAIN, tags: ['v2.5.2', 'v2.5.3'], version: '2.6.0' })).toEqual({
      channel: '2.6',
      edge: true,
      latest: true,
      npmTag: 'latest',
      release: true,
      version: '2.6.0'
    });
  });

  it('should release a release branch as latest when no higher version is tagged', () => {
    expect(planRelease({ ref: RELEASE_2_5, tags: ['v2.4.9', 'v2.5.2'], version: '2.5.3' })).toEqual({
      channel: '2.5',
      edge: false,
      latest: true,
      npmTag: 'latest',
      release: true,
      version: '2.5.3'
    });
  });

  it('should keep latest on the higher line when a release branch cuts an older patch', () => {
    expect(planRelease({ ref: RELEASE_2_5, tags: ['v2.5.3', 'v2.6.0'], version: '2.5.4' })).toMatchObject({
      latest: false,
      npmTag: 'release-2.5',
      release: true
    });
  });

  it('should ignore tags that are not plain versions when deciding latest', () => {
    expect(planRelease({ ref: MAIN, tags: ['v2-beta', 'v9.0.0-rc.1'], version: '2.6.0' })).toMatchObject({
      latest: true
    });
  });

  it('should refuse a release branch whose version is already tagged, so a dispatch without a bump fails', () => {
    expect(() => planRelease({ ref: RELEASE_2_5, tags: ['v2.5.3'], version: '2.5.3' })).toThrow(
      'v2.5.3 is already released; bump the version on refs/heads/release/2.5 first'
    );
  });

  it('should refuse a version from another line on a release branch', () => {
    expect(() => planRelease({ ref: RELEASE_2_5, tags: [], version: '2.6.0' })).toThrow(
      'Version 2.6.0 does not belong on refs/heads/release/2.5'
    );
  });

  it('should refuse any other ref, so a feature branch cannot publish', () => {
    expect(() => planRelease({ ref: 'refs/heads/feat/x', tags: [], version: '2.6.0' })).toThrow(
      'Releases are cut from refs/heads/main or refs/heads/release/<major>.<minor>, not refs/heads/feat/x'
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

  it('should expose the plan for the root version and the git tags as workflow outputs', async () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ version: '2.5.3' }));
    const setOutput = vi.fn();
    await release({
      context: { ref: RELEASE_2_5 },
      core: { setOutput },
      exec: { getExecOutput: () => Promise.resolve({ stdout: 'v2.5.1\nv2.5.2\n' }) }
    });
    expect(Object.fromEntries(setOutput.mock.calls)).toEqual({
      channel: '2.5',
      edge: 'false',
      latest: 'true',
      npmTag: 'latest',
      release: 'true',
      version: '2.5.3'
    });
  });
});

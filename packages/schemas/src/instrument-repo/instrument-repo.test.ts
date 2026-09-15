import { describe, expect, it } from 'vitest';

import { $CreateInstrumentRepoData, $InstrumentRepo } from './instrument-repo.js';

describe('$InstrumentRepo', () => {
  it('should accept a repo with lastSyncedAt omitted, since it is nullish', () => {
    expect(
      $InstrumentRepo.safeParse({
        createdAt: '2024-01-01',
        groupIds: [],
        id: 'repo-1',
        instrumentIds: [],
        name: 'My Repo',
        owner: 'douglasneuroinformatics',
        repoName: 'my-repo',
        updatedAt: '2024-01-01',
        url: 'https://github.com/douglasneuroinformatics/my-repo'
      }).success
    ).toBe(true);
  });
  it('should reject a repo with an empty name', () => {
    expect(
      $InstrumentRepo.safeParse({
        createdAt: '2024-01-01',
        groupIds: [],
        id: 'repo-1',
        instrumentIds: [],
        name: '',
        owner: 'douglasneuroinformatics',
        repoName: 'my-repo',
        updatedAt: '2024-01-01',
        url: 'https://github.com/douglasneuroinformatics/my-repo'
      }).success
    ).toBe(false);
  });
});

describe('$CreateInstrumentRepoData', () => {
  it('should accept a GitHub repository URL with the access token omitted', () => {
    expect(
      $CreateInstrumentRepoData.safeParse({ url: 'https://github.com/douglasneuroinformatics/my-repo' }).success
    ).toBe(true);
  });
  it('should accept a GitHub repository URL with a trailing .git', () => {
    expect(
      $CreateInstrumentRepoData.safeParse({ url: 'https://github.com/douglasneuroinformatics/my-repo.git' }).success
    ).toBe(true);
  });
  it('should reject a non-GitHub URL', () => {
    expect(
      $CreateInstrumentRepoData.safeParse({ url: 'https://gitlab.com/douglasneuroinformatics/my-repo' }).success
    ).toBe(false);
  });
  it('should accept an access token for a private repository', () => {
    expect(
      $CreateInstrumentRepoData.safeParse({
        accessToken: 'ghp_secret',
        url: 'https://github.com/douglasneuroinformatics/my-repo'
      }).success
    ).toBe(true);
  });
});

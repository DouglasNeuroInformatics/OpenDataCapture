import { describe, expect, it } from 'vitest';

import { $CreateInstrumentRepoData, $InstrumentRepo, $InstrumentRepoSyncLog } from '../instrument-repo.js';

describe('$InstrumentRepo', () => {
  it('should accept a repo with lastSyncedAt omitted, since it is nullish', () => {
    expect(
      $InstrumentRepo.safeParse({
        createdAt: '2024-01-01T00:00:00.000Z',
        groupIds: [],
        id: 'repo-1',
        instrumentIds: [],
        name: 'My Repo',
        owner: 'douglasneuroinformatics',
        repoName: 'my-repo',
        updatedAt: '2024-01-01T00:00:00.000Z',
        url: 'https://github.com/douglasneuroinformatics/my-repo'
      }).success
    ).toBe(true);
  });
  it('should reject a repo with an empty name', () => {
    expect(
      $InstrumentRepo.safeParse({
        createdAt: '2024-01-01T00:00:00.000Z',
        groupIds: [],
        id: 'repo-1',
        instrumentIds: [],
        name: '',
        owner: 'douglasneuroinformatics',
        repoName: 'my-repo',
        updatedAt: '2024-01-01T00:00:00.000Z',
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

describe('$InstrumentRepoSyncLog', () => {
  const log = {
    action: 'SYNC',
    createdAt: '2024-01-01T00:00:00.000Z',
    failures: [],
    importedCount: 22,
    repoName: 'my-repo',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  it('should accept an entry with createdCount omitted, since entries recorded before it was counted have none', () => {
    expect($InstrumentRepoSyncLog.safeParse({ ...log, id: 'log-1' }).success).toBe(true);
  });
  it('should accept an entry whose createdCount is a subset of what it imported', () => {
    expect($InstrumentRepoSyncLog.safeParse({ ...log, createdCount: 12, id: 'log-1' }).success).toBe(true);
  });
  it('should reject a negative createdCount, which no count of created instruments can be', () => {
    expect($InstrumentRepoSyncLog.safeParse({ ...log, createdCount: -1, id: 'log-1' }).success).toBe(false);
  });
});

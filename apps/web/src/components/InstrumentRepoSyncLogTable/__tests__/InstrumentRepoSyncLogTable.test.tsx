import type { InstrumentRepoSyncLog } from '@opendatacapture/schemas/instrument-repo';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InstrumentRepoSyncLogTable } from '../InstrumentRepoSyncLogTable';

import '@/services/i18n';

const theme = vi.hoisted(() => ({ current: 'light' }));

vi.mock('@douglasneuroinformatics/libui/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@douglasneuroinformatics/libui/hooks')>()),
  useTheme: () => [theme.current, vi.fn()]
}));

const logFixture = (overrides: Partial<InstrumentRepoSyncLog> = {}): InstrumentRepoSyncLog => ({
  action: 'SYNC',
  createdAt: new Date('2026-10-01T12:00:00Z'),
  failures: [],
  id: 'log-1',
  importedCount: 4,
  message: null,
  repoId: 'repo-1',
  repoName: 'Core Repo',
  updatedAt: new Date('2026-10-01T12:00:00Z'),
  ...overrides
});

const rows = () => screen.getAllByTestId('data-table-row');

const statuses = () => screen.getAllByTestId('sync-log-status').map((badge) => badge.textContent);

afterEach(() => {
  cleanup();
  theme.current = 'light';
});

describe('InstrumentRepoSyncLogTable', () => {
  it('should mark a sync with no failed instrument as a success', () => {
    render(<InstrumentRepoSyncLogTable logs={[logFixture()]} />);
    expect(statuses()).toEqual(['Success']);
    expect(within(rows()[0]!).getByText('-')).toBeTruthy();
  });

  it('should mark a sync that skipped some instruments as a partial success, and say which and why', () => {
    render(
      <InstrumentRepoSyncLogTable
        logs={[
          logFixture({
            failures: [{ instrumentDir: 'PHQ_9', message: 'Instrument validation failed', stage: 'LOAD' }]
          })
        ]}
      />
    );
    expect(statuses()).toEqual(['Partial success']);
    const messages = screen.getByTestId('sync-log-messages');
    expect(within(messages).getByText('PHQ_9')).toBeTruthy();
    expect(within(messages).getByText('Load')).toBeTruthy();
    expect(messages.textContent).toContain('Instrument validation failed');
  });

  it('should mark a sync that could not read the repository as failed, with the reason', () => {
    render(<InstrumentRepoSyncLogTable logs={[logFixture({ importedCount: 0, message: 'Repository not found' })]} />);
    expect(statuses()).toEqual(['Failed']);
    expect(within(screen.getByTestId('sync-log-messages')).getByText('Repository not found')).toBeTruthy();
  });

  it('should label an import and a compile failure in words rather than as codes', () => {
    render(
      <InstrumentRepoSyncLogTable
        logs={[logFixture({ action: 'IMPORT', failures: [{ instrumentDir: 'A', message: 'x', stage: 'BUNDLE' }] })]}
      />
    );
    expect(within(rows()[0]!).getByText('Import')).toBeTruthy();
    expect(within(rows()[0]!).getByText('Compile')).toBeTruthy();
  });

  it('should list the newest entry first until another column is sorted', () => {
    render(
      <InstrumentRepoSyncLogTable
        logs={[
          logFixture({ createdAt: new Date('2026-09-01'), id: 'older', repoName: 'Older' }),
          logFixture({ createdAt: new Date('2026-10-01'), id: 'newer', repoName: 'Newer' })
        ]}
      />
    );
    expect(within(rows()[0]!).getByText('Newer')).toBeTruthy();
  });

  it('should sort by a column when its header is clicked', () => {
    render(
      <InstrumentRepoSyncLogTable
        logs={[
          logFixture({ createdAt: new Date('2026-10-01'), id: 'b', repoName: 'Beta' }),
          logFixture({ createdAt: new Date('2026-09-01'), id: 'a', repoName: 'Alpha' })
        ]}
      />
    );
    fireEvent.click(within(screen.getByTestId('data-table-head')).getByText('Repository'));
    expect(within(rows()[0]!).getByText('Alpha')).toBeTruthy();
  });

  it('should group entries by status when the status header is clicked', () => {
    render(
      <InstrumentRepoSyncLogTable
        logs={[
          logFixture({ createdAt: new Date('2026-10-02'), id: 'success' }),
          logFixture({ createdAt: new Date('2026-10-01'), id: 'failed', message: 'Repository not found' })
        ]}
      />
    );
    fireEvent.click(within(screen.getByTestId('data-table-head')).getByText('Status'));
    expect(statuses()).toEqual(['Failed', 'Success']);
  });

  it('should colour the status dot for the dark theme when the app is dark', () => {
    theme.current = 'dark';
    render(<InstrumentRepoSyncLogTable logs={[logFixture()]} />);
    const dot = screen.getByTestId('sync-log-status').firstElementChild as HTMLElement;
    expect(dot.style.backgroundColor).toBe('#22c55e');
  });

  it('should colour the status dot for the light theme otherwise', () => {
    render(<InstrumentRepoSyncLogTable logs={[logFixture({ message: 'Repository not found' })]} />);
    const dot = screen.getByTestId('sync-log-status').firstElementChild as HTMLElement;
    expect(dot.style.backgroundColor).toBe('#dc2626');
  });
});

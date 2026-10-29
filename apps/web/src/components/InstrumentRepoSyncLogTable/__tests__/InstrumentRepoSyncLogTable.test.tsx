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
  it('should say so in one line when there is nothing to show, rather than render an empty table', () => {
    render(<InstrumentRepoSyncLogTable logs={[]} />);
    expect(screen.getByText('No imports or syncs recorded yet.')).toBeTruthy();
    expect(screen.queryByTestId('data-table')).toBeNull();
  });

  it('should summarize one failure as a single plain-text line, clipped rather than wrapped', () => {
    const message = 'Instrument validation failed - content.0: Series item PHQ_9 edition 2 does not exist';
    render(
      <InstrumentRepoSyncLogTable
        logs={[logFixture({ failures: [{ instrumentDir: 'CPP_SERIES', message, stage: 'LOAD' }] })]}
      />
    );
    const summary = screen.getByTestId('sync-log-messages');
    expect(summary.textContent).toBe(`CPP_SERIES (Load): ${message}`);
    expect(summary.className).toContain('whitespace-nowrap');
    expect(summary.className).toContain('text-ellipsis');
  });

  it('should summarize several failures as a count, so the row stays one line however many there are', () => {
    render(
      <InstrumentRepoSyncLogTable
        logs={[
          logFixture({
            failures: [
              { instrumentDir: 'A', message: 'broken', stage: 'BUNDLE' },
              { instrumentDir: 'B', message: 'also broken', stage: 'LOAD' }
            ]
          })
        ]}
      />
    );
    expect(screen.getByTestId('sync-log-messages').textContent).toBe('2 instruments failed');
  });

  it('should show every failure in full when View is clicked, since the cell only holds a summary', () => {
    const message = 'Transform failed with 1 error: /BROKEN_FORM/index.ts:14:22: ERROR: Expected ")" but found "{"';
    render(
      <InstrumentRepoSyncLogTable
        logs={[
          logFixture({
            failures: [
              { instrumentDir: 'BROKEN_FORM', message, stage: 'BUNDLE' },
              { instrumentDir: 'MOCA_V2', message: 'details.title: Expected string', stage: 'LOAD' }
            ]
          })
        ]}
      />
    );
    fireEvent.click(screen.getByTestId('sync-log-view-messages'));
    const details = screen.getByTestId('sync-log-error-details');
    expect(within(details).getByText(message)).toBeTruthy();
    expect(within(details).getByText('details.title: Expected string')).toBeTruthy();
    expect(within(details).getByText('BROKEN_FORM')).toBeTruthy();
    expect(within(details).getByText('Compile')).toBeTruthy();
  });

  it('should close the error dialog on dismissal, so another row can be inspected next', () => {
    render(
      <InstrumentRepoSyncLogTable
        logs={[logFixture({ failures: [{ instrumentDir: 'A', message: 'broken', stage: 'LOAD' }] })]}
      />
    );
    fireEvent.click(screen.getByTestId('sync-log-view-messages'));
    expect(screen.queryByTestId('sync-log-error-details')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByTestId('sync-log-error-details')).toBeNull();
  });

  it('should show the reason the whole repository could not be read in the dialog too', () => {
    render(<InstrumentRepoSyncLogTable logs={[logFixture({ message: 'Repository not found (404)' })]} />);
    fireEvent.click(screen.getByTestId('sync-log-view-messages'));
    expect(within(screen.getByTestId('sync-log-error-details')).getByText('Repository not found (404)')).toBeTruthy();
  });

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
    expect(screen.getByTestId('sync-log-messages').textContent).toBe('PHQ_9 (Load): Instrument validation failed');
  });

  it('should mark a sync that could not read the repository as failed, with the reason', () => {
    render(<InstrumentRepoSyncLogTable logs={[logFixture({ importedCount: 0, message: 'Repository not found' })]} />);
    expect(statuses()).toEqual(['Failed']);
    expect(screen.getByTestId('sync-log-messages').textContent).toBe('Repository not found');
  });

  it('should label an import and a compile failure in words rather than as codes', () => {
    render(
      <InstrumentRepoSyncLogTable
        logs={[logFixture({ action: 'IMPORT', failures: [{ instrumentDir: 'A', message: 'x', stage: 'BUNDLE' }] })]}
      />
    );
    expect(within(rows()[0]!).getByText('Import')).toBeTruthy();
    expect(within(rows()[0]!).getByTestId('sync-log-messages').textContent).toBe('A (Compile): x');
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

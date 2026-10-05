import type { ReactNode } from 'react';

import type { $UpdateGroupData, Group } from '@opendatacapture/schemas/group';
import type { CreateSeriesInstrumentResult, TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InstrumentPreviewItem } from '@/components/InstrumentPreviewDialog';
import { Route } from '@/routes/_app/group/manage';

import '@/services/i18n';

type DeleteCallbacks = { onSettled: () => void; onSuccess: () => void };

const mocks = vi.hoisted(() => ({
  changeGroup: vi.fn(),
  createMutateAsync: vi.fn(),
  deleteMutate: vi.fn(),
  instruments: undefined as TranslatedInstrumentInfo[] | undefined,
  isDemo: false,
  store: { currentGroup: null as Group | null },
  updateMutateAsync: vi.fn<(data: Partial<$UpdateGroupData>) => Promise<Group>>()
}));

vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: () => ({ data: mocks.instruments })
}));
vi.mock('@/hooks/useCreateSeriesInstrumentMutation', () => ({
  useCreateSeriesInstrumentMutation: () => ({ isPending: false, mutateAsync: mocks.createMutateAsync })
}));
vi.mock('@/hooks/useDeleteSeriesInstrumentMutation', () => ({
  useDeleteSeriesInstrumentMutation: () => ({ isPending: false, mutate: mocks.deleteMutate })
}));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { isDemo: mocks.isDemo } })
}));
vi.mock('@/hooks/useUpdateGroupMutation', () => ({
  useUpdateGroupMutation: () => ({ mutateAsync: mocks.updateMutateAsync })
}));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: { changeGroup: typeof mocks.changeGroup; currentGroup: Group | null }) => unknown) =>
    selector({ changeGroup: mocks.changeGroup, currentGroup: mocks.store.currentGroup })
}));
vi.mock('@/components/LoadingFallback', () => ({
  LoadingFallback: () => <div data-testid="loading-fallback" />
}));
vi.mock('@/components/InstrumentPreviewDialog', () => ({
  InstrumentPreviewDialog: ({
    item,
    items,
    onClose
  }: {
    item: InstrumentPreviewItem;
    items: { id: string; title: string }[];
    onClose: () => void;
  }) => (
    <div data-items={items.map(({ id }) => id).join(',')} data-testid="preview-dialog" data-title={item.title}>
      <button aria-label="Close preview" type="button" onClick={onClose} />
    </div>
  )
}));

const scalar = ({
  createdAt = null,
  id,
  kind = 'FORM',
  sourceRepo = null,
  title
}: {
  createdAt?: Date | null;
  id: string;
  kind?: 'FILE' | 'FORM' | 'INTERACTIVE';
  sourceRepo?: null | { id: string; name: null | string };
  title: string;
}): TranslatedInstrumentInfo => ({
  __runtimeVersion: 1,
  createdAt,
  details: { authors: null, description: `${title} description`, license: 'MIT', title },
  id,
  internal: { edition: 1, name: id },
  kind,
  language: 'en',
  sourceRepo,
  supportedLanguages: ['en'],
  tags: []
});

const series = ({
  archivedAt = null,
  id,
  seriesGroupId,
  seriesItems,
  title
}: {
  archivedAt?: Date | null;
  id: string;
  seriesGroupId?: null | string;
  seriesItems: string[];
  title: string;
}): TranslatedInstrumentInfo => ({
  __runtimeVersion: 1,
  archivedAt,
  details: { authors: null, description: `${title} description`, license: 'MIT', title },
  id,
  kind: 'SERIES',
  language: 'en',
  seriesGroupId,
  seriesItems: seriesItems.map((itemId) => ({ id: itemId })),
  supportedLanguages: ['en'],
  tags: []
});

const makeGroup = ({
  accessibleInstrumentIds = ['form-1', 'series-own', 'missing-1'],
  settings = { defaultIdentificationMethod: 'CUSTOM_ID' }
}: Partial<Pick<Group, 'accessibleInstrumentIds' | 'settings'>> = {}): Group => ({
  accessibleInstrumentIds,
  createdAt: new Date('2026-01-01'),
  id: 'group-1',
  instrumentRepoIds: ['repo-core'],
  name: 'Group One',
  settings,
  subjectIds: [],
  type: 'RESEARCH',
  updatedAt: new Date('2026-01-01'),
  userIds: []
});

const defaultInstruments = () => [
  scalar({ createdAt: new Date('2026-01-15T12:00:00Z'), id: 'form-1', title: 'Happiness Questionnaire' }),
  scalar({ id: 'form-2', sourceRepo: { id: 'repo-core', name: 'Core Repo' }, title: 'Breakfast Survey' }),
  scalar({ id: 'interactive-1', kind: 'INTERACTIVE', title: 'Reaction Task' }),
  series({ id: 'series-own', seriesGroupId: 'group-1', seriesItems: ['form-1', 'form-2'], title: 'Baseline Battery' }),
  series({ id: 'series-shared', seriesItems: ['form-1', 'interactive-1'], title: 'Shared Battery' })
];

const RouteComponent = Route.options.component!;

const renderPage = () => render(<RouteComponent />);

const rerenderPage = (rerender: (ui: ReactNode) => void) => rerender(<RouteComponent />);

const checkbox = (title: string) => screen.getByTestId(`instrument-checkbox-${title}`);
const isChecked = (title: string) => checkbox(title).getAttribute('aria-checked') === 'true';
const submitSettings = () => fireEvent.click(screen.getByLabelText('Submit'));
const savedIds = () => mocks.updateMutateAsync.mock.lastCall?.[0].accessibleInstrumentIds;

const openCreateDialog = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Create series' }));
  return screen.getByRole('dialog', { name: 'Create Series Instrument' });
};

const fillSeries = (dialog: HTMLElement, { picks, title }: { picks: string[]; title: string }) => {
  fireEvent.change(within(dialog).getByLabelText('Name'), { target: { value: title } });
  for (const pick of picks) {
    fireEvent.click(within(dialog).getByText(pick));
  }
};

const seriesOrder = (dialog: HTMLElement, title: string) => {
  const row = within(dialog).getByTitle(title).closest('label');
  if (!row) {
    throw new Error(`No series item row holds "${title}"`);
  }
  return within(row).queryByText(/^\d+$/)?.textContent ?? null;
};

const createButton = (dialog: HTMLElement) => within(dialog).getByRole('button', { name: 'Create' });

const resolveCreate = (result: CreateSeriesInstrumentResult) => mocks.createMutateAsync.mockResolvedValueOnce(result);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.instruments = defaultInstruments();
  mocks.isDemo = false;
  mocks.store.currentGroup = makeGroup();
  mocks.updateMutateAsync.mockResolvedValue({ ...makeGroup(), name: 'Updated Group' });
  mocks.deleteMutate.mockImplementation((_: unknown, callbacks: DeleteCallbacks) => {
    callbacks.onSuccess();
    callbacks.onSettled();
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('manage group page', () => {
  describe('instrument list', () => {
    it('should show a loading fallback until the instrument info has loaded', () => {
      mocks.instruments = undefined;
      renderPage();
      expect(screen.getByTestId('loading-fallback')).toBeTruthy();
      expect(screen.queryByText('Accessible Instruments')).toBeNull();
    });

    it('should show a loading fallback when no group is selected, since there is nothing to manage', () => {
      mocks.store.currentGroup = null;
      renderPage();
      expect(screen.getByTestId('loading-fallback')).toBeTruthy();
      expect(screen.queryByText('Accessible Instruments')).toBeNull();
    });

    it('should list manual and assigned-repo instruments, and selected ones from unassigned repos', () => {
      mocks.instruments = [
        ...defaultInstruments(),
        scalar({ id: 'form-3', sourceRepo: { id: 'repo-other', name: 'Other' }, title: 'Hidden Form' }),
        scalar({ id: 'form-4', sourceRepo: { id: 'repo-other', name: 'Other' }, title: 'Kept Form' })
      ];
      mocks.store.currentGroup = makeGroup({ accessibleInstrumentIds: ['form-4'] });
      renderPage();
      expect(screen.getByTestId('instrument-checkbox-Kept Form')).toBeTruthy();
      expect(screen.getByTestId('instrument-checkbox-Breakfast Survey')).toBeTruthy();
      expect(screen.queryByTestId('instrument-checkbox-Hidden Form')).toBeNull();
    });

    it('should leave archived series out of the list', () => {
      mocks.instruments = [
        ...defaultInstruments(),
        series({ archivedAt: new Date('2026-02-01'), id: 'series-old', seriesItems: [], title: 'Old Battery' })
      ];
      renderPage();
      expect(screen.queryByTestId('instrument-checkbox-Old Battery')).toBeNull();
    });

    it('should leave file instruments out of every section', () => {
      mocks.instruments = [...defaultInstruments(), scalar({ id: 'file-1', kind: 'FILE', title: 'Upload Task' })];
      renderPage();
      expect(screen.queryByTestId('instrument-checkbox-Upload Task')).toBeNull();
    });

    it('should tag repo instruments with their repo name and manual ones as having no repo', () => {
      renderPage();
      expect(screen.getByText('Core Repo')).toBeTruthy();
      expect(screen.getAllByText('No repo')).toHaveLength(4);
    });

    it('should tag a repo instrument whose repo name was never stored as from an unknown repository', () => {
      mocks.instruments = [scalar({ id: 'form-9', sourceRepo: { id: 'repo-core', name: null }, title: 'Legacy' })];
      renderPage();
      expect(screen.getByText('Unknown repository')).toBeTruthy();
    });

    it('should show a creation date only for instruments that have one', () => {
      renderPage();
      expect(screen.getByTestId('instrument-created-at-Happiness Questionnaire').textContent).toBe('2026-01-15');
      expect(screen.queryByTestId('instrument-created-at-Breakfast Survey')).toBeNull();
    });

    it('should check the instruments the group can already access', () => {
      renderPage();
      expect(isChecked('Happiness Questionnaire')).toBe(true);
      expect(isChecked('Baseline Battery')).toBe(true);
      expect(isChecked('Breakfast Survey')).toBe(false);
    });

    it('should tell the user when a section has no instruments', () => {
      mocks.instruments = defaultInstruments().filter((instrument) => instrument.kind !== 'INTERACTIVE');
      renderPage();
      expect(screen.getAllByText('No instruments available.')).toHaveLength(1);
    });

    it('should filter every section by a case-insensitive title search', () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText('Search instruments...'), { target: { value: 'BATTERY' } });
      expect(screen.queryByTestId('instrument-checkbox-Happiness Questionnaire')).toBeNull();
      expect(screen.getByTestId('instrument-checkbox-Shared Battery')).toBeTruthy();
    });

    it('should toggle an instrument when its title is clicked', () => {
      renderPage();
      fireEvent.click(screen.getByTitle('Breakfast Survey'));
      expect(isChecked('Breakfast Survey')).toBe(true);
      fireEvent.click(screen.getByTitle('Breakfast Survey'));
      expect(isChecked('Breakfast Survey')).toBe(false);
    });

    it('should toggle an instrument when its checkbox is clicked', () => {
      renderPage();
      fireEvent.click(checkbox('Happiness Questionnaire'));
      expect(isChecked('Happiness Questionnaire')).toBe(false);
    });

    it('should preview an instrument against the full list, so series items resolve to titles', () => {
      renderPage();
      fireEvent.click(screen.getByTestId('instrument-preview-Baseline Battery'));
      const preview = screen.getByTestId('preview-dialog');
      expect(preview.dataset.title).toBe('Baseline Battery');
      expect(preview.dataset.items).toBe('form-1,form-2,interactive-1,series-own,series-shared');
    });

    it('should close the preview when the dialog asks to', () => {
      renderPage();
      fireEvent.click(screen.getByTestId('instrument-preview-Reaction Task'));
      fireEvent.click(screen.getByLabelText('Close preview'));
      expect(screen.queryByTestId('preview-dialog')).toBeNull();
    });
  });

  describe('read-only demo', () => {
    beforeEach(() => {
      mocks.isDemo = true;
      vi.stubEnv('PROD', true);
    });

    it('should explain that editing is disabled in a production demo', () => {
      renderPage();
      expect(screen.getByText(/disabled in demo mode/)).toBeTruthy();
    });

    it('should disable selection in a production demo', () => {
      renderPage();
      expect(checkbox('Happiness Questionnaire').hasAttribute('disabled')).toBe(true);
    });

    it('should hide the create and delete controls in a production demo', () => {
      renderPage();
      expect(screen.queryByRole('button', { name: 'Create series' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Delete instrument' })).toBeNull();
    });

    it('should keep selection enabled in a demo that is not a production build', () => {
      vi.stubEnv('PROD', false);
      renderPage();
      expect(checkbox('Happiness Questionnaire').hasAttribute('disabled')).toBe(false);
    });

    it('should keep the create control in a demo that is not a production build', () => {
      vi.stubEnv('PROD', false);
      renderPage();
      expect(screen.getByRole('button', { name: 'Create series' })).toBeTruthy();
    });

    it('should leave out the demo-mode note in a demo that is not a production build', () => {
      vi.stubEnv('PROD', false);
      renderPage();
      expect(screen.queryByText(/disabled in demo mode/)).toBeNull();
    });
  });

  describe('deleting a series', () => {
    it('should offer deletion only for the series this group owns', () => {
      renderPage();
      expect(screen.getAllByRole('button', { name: 'Delete instrument' })).toHaveLength(1);
    });

    it('should delete the series once the user confirms', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Delete instrument' }));
      expect(screen.getByText(/delete "Baseline Battery"/)).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
      expect(mocks.deleteMutate).toHaveBeenCalledWith({ id: 'series-own' }, expect.anything());
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should not re-send a deleted series on save, since the server has already detached it', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Delete instrument' }));
      fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
      submitSettings();
      await waitFor(() => expect(mocks.updateMutateAsync).toHaveBeenCalled());
      expect(savedIds()).not.toContain('series-own');
    });

    it('should keep a series the server refused to delete in the saved selection', async () => {
      mocks.deleteMutate.mockImplementation((_: unknown, callbacks: DeleteCallbacks) => callbacks.onSettled());
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Delete instrument' }));
      fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
      submitSettings();
      await waitFor(() => expect(mocks.updateMutateAsync).toHaveBeenCalled());
      expect(savedIds()).toContain('series-own');
    });

    it('should close the confirmation without deleting when the user declines', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Delete instrument' }));
      fireEvent.click(screen.getByRole('button', { name: 'No' }));
      expect(mocks.deleteMutate).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should close the confirmation without deleting when it is dismissed', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Delete instrument' }));
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(mocks.deleteMutate).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('creating a series', () => {
    it('should offer only scalar instruments as series items', () => {
      renderPage();
      const dialog = openCreateDialog();
      expect(within(dialog).getByText('Reaction Task')).toBeTruthy();
      expect(within(dialog).queryByText('Baseline Battery')).toBeNull();
    });

    it('should filter the available instruments by a case-insensitive search', () => {
      renderPage();
      const dialog = openCreateDialog();
      fireEvent.change(within(dialog).getByPlaceholderText('Search instruments...'), { target: { value: 'REACT' } });
      expect(within(dialog).queryByText('Breakfast Survey')).toBeNull();
      expect(within(dialog).getByText('Reaction Task')).toBeTruthy();
    });

    it('should tell the user when no instrument matches the search', () => {
      renderPage();
      const dialog = openCreateDialog();
      fireEvent.change(within(dialog).getByPlaceholderText('Search instruments...'), { target: { value: 'zzz' } });
      expect(within(dialog).getByText('No instruments available.')).toBeTruthy();
    });

    it('should number the picked instruments by pick order rather than list order', () => {
      renderPage();
      const dialog = openCreateDialog();
      fillSeries(dialog, { picks: ['Reaction Task', 'Breakfast Survey'], title: '' });
      expect(seriesOrder(dialog, 'Reaction Task')).toBe('1');
      expect(seriesOrder(dialog, 'Breakfast Survey')).toBe('2');
    });

    it('should renumber the remaining picks when one is unpicked', () => {
      renderPage();
      const dialog = openCreateDialog();
      fillSeries(dialog, { picks: ['Reaction Task', 'Breakfast Survey', 'Reaction Task'], title: '' });
      expect(seriesOrder(dialog, 'Breakfast Survey')).toBe('1');
      expect(seriesOrder(dialog, 'Reaction Task')).toBeNull();
    });

    it('should count the picked instruments in the list heading', () => {
      renderPage();
      const dialog = openCreateDialog();
      fillSeries(dialog, { picks: ['Reaction Task', 'Breakfast Survey', 'Reaction Task'], title: '' });
      expect(within(dialog).getByText(/Available instruments/).textContent).toBe('Available instruments (1)');
    });

    it('should refuse a name another instrument already uses, ignoring case and whitespace', () => {
      renderPage();
      const dialog = openCreateDialog();
      fillSeries(dialog, { picks: ['Reaction Task', 'Breakfast Survey'], title: '  shared battery ' });
      expect(within(dialog).getByText('An instrument with this name already exists.')).toBeTruthy();
      expect(createButton(dialog).hasAttribute('disabled')).toBe(true);
    });

    it('should require at least two instruments before creating', () => {
      renderPage();
      const dialog = openCreateDialog();
      fillSeries(dialog, { picks: ['Reaction Task'], title: 'New Battery' });
      expect(createButton(dialog).hasAttribute('disabled')).toBe(true);
    });

    it('should create the series in the current language from the trimmed inputs and picked order', async () => {
      resolveCreate({ instrumentId: 'series-new', outcome: 'created' });
      renderPage();
      const dialog = openCreateDialog();
      fillSeries(dialog, { picks: ['Reaction Task', 'Breakfast Survey'], title: ' New Battery ' });
      fireEvent.change(within(dialog).getByLabelText('Description'), { target: { value: ' A summary ' } });
      fireEvent.change(within(dialog).getByLabelText('Instructions'), { target: { value: ' Begin now ' } });
      fireEvent.click(createButton(dialog));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(mocks.createMutateAsync).toHaveBeenCalledWith({
        clientDetails: { instructions: ['Begin now'] },
        details: { description: 'A summary', title: 'New Battery' },
        groupId: 'group-1',
        items: [
          { edition: 1, name: 'interactive-1' },
          { edition: 1, name: 'form-2' }
        ],
        language: 'en'
      });
    });

    it('should omit the description and instructions when they are left blank', async () => {
      resolveCreate({ instrumentId: 'series-new', outcome: 'created' });
      renderPage();
      fillSeries(openCreateDialog(), { picks: ['Reaction Task', 'Breakfast Survey'], title: 'New Battery' });
      fireEvent.click(createButton(screen.getByRole('dialog')));
      await waitFor(() => expect(mocks.createMutateAsync).toHaveBeenCalled());
      expect(mocks.createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ clientDetails: undefined, details: { title: 'New Battery' } })
      );
    });

    it('should select the new series, so saving grants the group access to it', async () => {
      resolveCreate({ instrumentId: 'series-new', outcome: 'created' });
      renderPage();
      fillSeries(openCreateDialog(), { picks: ['Reaction Task', 'Breakfast Survey'], title: 'New Battery' });
      fireEvent.click(createButton(screen.getByRole('dialog')));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      submitSettings();
      await waitFor(() => expect(mocks.updateMutateAsync).toHaveBeenCalled());
      expect(savedIds()).toContain('series-new');
    });

    it('should keep the dialog open for a retry when creation fails', async () => {
      mocks.createMutateAsync.mockRejectedValueOnce(new Error('Network Error'));
      renderPage();
      const dialog = openCreateDialog();
      fillSeries(dialog, { picks: ['Reaction Task', 'Breakfast Survey'], title: 'New Battery' });
      fireEvent.click(createButton(dialog));
      await waitFor(() => expect(mocks.createMutateAsync).toHaveBeenCalled());
      expect(screen.getByRole('dialog', { name: 'Create Series Instrument' })).toBeTruthy();
    });

    it('should do nothing when a refetch has removed a picked instrument, leaving fewer than two', () => {
      const { rerender } = renderPage();
      const dialog = openCreateDialog();
      fillSeries(dialog, { picks: ['Reaction Task', 'Breakfast Survey'], title: 'New Battery' });
      mocks.instruments = defaultInstruments().filter((instrument) => instrument.id !== 'form-2');
      rerenderPage(rerender);
      fireEvent.click(createButton(dialog));
      expect(mocks.createMutateAsync).not.toHaveBeenCalled();
    });

    it('should close when cancelled', () => {
      renderPage();
      fireEvent.click(within(openCreateDialog()).getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('should close when dismissed', () => {
      renderPage();
      fireEvent.keyDown(openCreateDialog(), { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('creating a duplicate series', () => {
    const submitDuplicate = async (
      existingTitle: Extract<CreateSeriesInstrumentResult, { outcome: 'duplicate' }>['existingTitle']
    ) => {
      resolveCreate({ existingTitle, outcome: 'duplicate' });
      const { rerender } = renderPage();
      const dialog = openCreateDialog();
      fillSeries(dialog, { picks: ['Reaction Task', 'Breakfast Survey'], title: 'New Battery' });
      fireEvent.click(createButton(dialog));
      return { prompt: await screen.findByRole('dialog', { name: 'Series Already Exists' }), rerender };
    };

    it('should name the existing series that already contains the same forms', async () => {
      const { prompt } = await submitDuplicate('Shared Battery');
      expect(within(prompt).getByText(/A series named "Shared Battery".*create "New Battery"/)).toBeTruthy();
    });

    it('should name a multilingual existing series in the current language', async () => {
      const { prompt } = await submitDuplicate({ en: 'Shared Battery', fr: 'Batterie partagée' });
      expect(within(prompt).getByText(/A series named "Shared Battery"/)).toBeTruthy();
    });

    it('should create the series anyway, selected, once the user confirms the duplicate', async () => {
      const { prompt } = await submitDuplicate('Shared Battery');
      resolveCreate({ instrumentId: 'series-new', outcome: 'created' });
      fireEvent.click(within(prompt).getByRole('button', { name: 'Yes, create anyway' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(mocks.createMutateAsync).toHaveBeenLastCalledWith(expect.objectContaining({ confirmDuplicate: true }));
      submitSettings();
      await waitFor(() => expect(mocks.updateMutateAsync).toHaveBeenCalled());
      expect(savedIds()).toContain('series-new');
    });

    it('should close without selecting anything when the confirmed request still reports a duplicate', async () => {
      const { prompt } = await submitDuplicate('Shared Battery');
      resolveCreate({ existingTitle: 'Shared Battery', outcome: 'duplicate' });
      fireEvent.click(within(prompt).getByRole('button', { name: 'Yes, create anyway' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      submitSettings();
      await waitFor(() => expect(mocks.updateMutateAsync).toHaveBeenCalled());
      expect(savedIds()).not.toContain('series-new');
    });

    it('should keep both dialogs open for a retry when the confirmed request fails', async () => {
      const { prompt } = await submitDuplicate('Shared Battery');
      mocks.createMutateAsync.mockRejectedValueOnce(new Error('Network Error'));
      fireEvent.click(within(prompt).getByRole('button', { name: 'Yes, create anyway' }));
      await waitFor(() => expect(mocks.createMutateAsync).toHaveBeenCalledTimes(2));
      expect(screen.getByRole('dialog', { name: 'Series Already Exists' })).toBeTruthy();
      expect(screen.getByRole('heading', { hidden: true, name: 'Create Series Instrument' })).toBeTruthy();
    });

    it('should do nothing on confirmation when a refetch has removed a picked instrument', async () => {
      const { prompt, rerender } = await submitDuplicate('Shared Battery');
      mocks.instruments = defaultInstruments().filter((instrument) => instrument.id !== 'form-2');
      rerenderPage(rerender);
      fireEvent.click(within(prompt).getByRole('button', { name: 'Yes, create anyway' }));
      expect(mocks.createMutateAsync).toHaveBeenCalledTimes(1);
    });

    it('should return to the create dialog when the user declines the duplicate', async () => {
      const { prompt } = await submitDuplicate('Shared Battery');
      fireEvent.click(within(prompt).getByRole('button', { name: 'No' }));
      expect(screen.queryByRole('dialog', { name: 'Series Already Exists' })).toBeNull();
      expect(screen.getByRole('dialog', { name: 'Create Series Instrument' })).toBeTruthy();
    });

    it('should return to the create dialog when the duplicate prompt is dismissed', async () => {
      const { prompt } = await submitDuplicate('Shared Battery');
      fireEvent.keyDown(prompt, { key: 'Escape' });
      expect(screen.queryByRole('dialog', { name: 'Series Already Exists' })).toBeNull();
      expect(screen.getByRole('dialog', { name: 'Create Series Instrument' })).toBeTruthy();
    });
  });

  describe('saving', () => {
    it('should save the selection with series items expanded and undisplayed accessible ids preserved', async () => {
      renderPage();
      submitSettings();
      await waitFor(() => expect(mocks.updateMutateAsync).toHaveBeenCalled());
      expect(savedIds()?.toSorted()).toEqual(['form-1', 'form-2', 'missing-1', 'series-own']);
    });

    it('should adopt the updated group returned by the server', async () => {
      renderPage();
      submitSettings();
      await waitFor(() => expect(mocks.changeGroup).toHaveBeenCalled());
      expect(mocks.changeGroup).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Group' }));
    });

    it('should save the group settings from the form', async () => {
      mocks.store.currentGroup = makeGroup({
        settings: {
          defaultIdentificationMethod: 'PERSONAL_INFO',
          idValidationRegex: '^[0-9]+$',
          idValidationRegexErrorMessage: { en: 'Digits only', fr: 'Chiffres seulement' },
          minimumAge: 18,
          subjectIdDisplayLength: 6
        }
      });
      renderPage();
      submitSettings();
      await waitFor(() => expect(mocks.updateMutateAsync).toHaveBeenCalled());
      expect(mocks.updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: {
            defaultIdentificationMethod: 'PERSONAL_INFO',
            idValidationRegex: '^[0-9]+$',
            idValidationRegexErrorMessage: { en: 'Digits only', fr: 'Chiffres seulement' },
            minimumAge: 18,
            subjectIdDisplayLength: 6
          }
        })
      );
    });

    it('should clear the minimum age when it is not applied', async () => {
      renderPage();
      submitSettings();
      await waitFor(() => expect(mocks.updateMutateAsync).toHaveBeenCalled());
      expect(mocks.updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ settings: expect.objectContaining({ minimumAge: null }) })
      );
    });

    it('should require an age once the minimum age is applied', async () => {
      renderPage();
      fireEvent.click(within(screen.getByRole('radiogroup')).getByRole('radio', { name: 'True' }));
      submitSettings();
      expect(await screen.findByText('Please enter an age')).toBeTruthy();
      expect(mocks.updateMutateAsync).not.toHaveBeenCalled();
    });

    it('should ask for custom validation messages only once a validation pattern is set', () => {
      mocks.store.currentGroup = makeGroup({
        settings: { defaultIdentificationMethod: 'CUSTOM_ID', idValidationRegex: '^[0-9]+$' }
      });
      renderPage();
      expect(screen.getByText('Custom ID Validation Message (English)')).toBeTruthy();
      expect(screen.getByText('Custom ID Validation Message (French)')).toBeTruthy();
    });

    it('should not ask for custom validation messages without a validation pattern', () => {
      renderPage();
      expect(screen.queryByText('Custom ID Validation Message (English)')).toBeNull();
    });
  });
});

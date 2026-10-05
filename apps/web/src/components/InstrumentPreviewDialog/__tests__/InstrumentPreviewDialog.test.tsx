import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentPreviewDialog } from '../InstrumentPreviewDialog';

import type { InstrumentPreviewItem } from '../InstrumentPreviewDialog';

import '@/services/i18n';

type BundleState = { data?: { id: string }; isError: boolean; isLoading: boolean };

const bundle = vi.hoisted(() => {
  const state: BundleState = { isError: false, isLoading: false };
  return { state, useInstrumentBundle: vi.fn() };
});

vi.mock('@/hooks/useInstrumentBundle', () => ({
  useInstrumentBundle: bundle.useInstrumentBundle
}));

vi.mock('@opendatacapture/react-core', () => ({
  InstrumentRenderer: ({
    onSubmit,
    submitButtonLabel,
    target
  }: {
    onSubmit: () => void;
    submitButtonLabel: { en: string };
    target: { id: string };
  }) => (
    <button data-target={target.id} data-testid="instrument-renderer" type="button" onClick={onSubmit}>
      {submitButtonLabel.en}
    </button>
  )
}));

const scalarItem: InstrumentPreviewItem = {
  availability: null,
  createdAt: null,
  id: 'instrument-1',
  internal: { edition: 2, name: 'HAPPINESS_QUESTIONNAIRE' },
  kind: 'FORM',
  source: { kind: 'manual' },
  title: 'Happiness Questionnaire'
};

const seriesItem: InstrumentPreviewItem = {
  ...scalarItem,
  availability: { kind: 'all' },
  id: 'series-1',
  internal: null,
  kind: 'SERIES',
  seriesItems: [{ id: 'instrument-1' }, { id: 'missing' }],
  title: 'Intake Series'
};

const items = [{ id: 'instrument-1', title: 'Happiness Questionnaire' }];

const renderDialog = (item: InstrumentPreviewItem, onClose = vi.fn()) => {
  render(<InstrumentPreviewDialog item={item} items={items} onClose={onClose} />);
  return onClose;
};

/** The text of the detail row whose label starts with `label`, or undefined when that row is not rendered. */
const detailText = (label: string) =>
  screen
    .queryAllByText(new RegExp(`^${label}`), { selector: 'span.font-medium' })
    .map((element) => element.parentElement?.textContent)
    .at(0);

const previewForm = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Preview Form' }));
};

describe('InstrumentPreviewDialog', () => {
  beforeEach(() => {
    void i18n.changeLanguage('en');
    bundle.state = { isError: false, isLoading: false };
    bundle.useInstrumentBundle.mockImplementation(() => bundle.state);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should title the dialog with the instrument title', () => {
    renderDialog(scalarItem);
    expect(screen.getByRole('dialog').querySelector('h2')?.textContent).toBe('Happiness Questionnaire');
  });

  it('should not fetch the bundle until the form is previewed, so browsing details downloads no source', () => {
    renderDialog(scalarItem);
    expect(bundle.useInstrumentBundle).toHaveBeenLastCalledWith(null);
  });

  it('should show the instrument kind', () => {
    renderDialog(scalarItem);
    expect(detailText('Kind')).toBe('Kind: FORM');
  });

  it('should show the description when the instrument has one', () => {
    renderDialog({ ...scalarItem, description: 'Measures happiness' });
    expect(detailText('Description')).toBe('Description: Measures happiness');
  });

  it('should omit the description row when the instrument has none', () => {
    renderDialog(scalarItem);
    expect(detailText('Description')).toBeUndefined();
  });

  it('should list the authors separated by commas', () => {
    renderDialog({ ...scalarItem, authors: ['Jane Doe', 'John Smith'] });
    expect(detailText('Authors')).toBe('Authors: Jane Doe, John Smith');
  });

  it('should omit the authors row when the author list is empty', () => {
    renderDialog({ ...scalarItem, authors: [] });
    expect(detailText('Authors')).toBeUndefined();
  });

  it('should omit the authors row when the instrument names no authors', () => {
    renderDialog({ ...scalarItem, authors: null });
    expect(detailText('Authors')).toBeUndefined();
  });

  it('should show the edition of a scalar instrument', () => {
    renderDialog(scalarItem);
    expect(detailText('Edition')).toBe('Edition: 2');
  });

  it('should omit the edition row for a series, which has no edition', () => {
    renderDialog(seriesItem);
    expect(detailText('Edition')).toBeUndefined();
  });

  it('should name the repository an imported instrument came from', () => {
    renderDialog({ ...scalarItem, source: { kind: 'repo', name: 'douglas/instruments' } });
    expect(detailText('Source')).toBe('Source: douglas/instruments');
  });

  it('should say a manually uploaded instrument has no repository', () => {
    renderDialog(scalarItem);
    expect(detailText('Source')).toBe('Source: No repo; it was manually added to the platform');
  });

  it('should show the date the instrument was added', () => {
    renderDialog({ ...scalarItem, createdAt: new Date(2026, 0, 15, 12) });
    expect(screen.getByTestId('instrument-created-at').textContent).toBe('Added: 2026-01-15');
  });

  it('should omit the added row when the creation date is unknown', () => {
    renderDialog(scalarItem);
    expect(screen.queryByTestId('instrument-created-at')).toBeNull();
  });

  it('should omit the availability row for a scalar instrument, which no group owns', () => {
    renderDialog(scalarItem);
    expect(screen.queryByTestId('instrument-availability')).toBeNull();
  });

  it('should say a series without an owner is available to all groups', () => {
    renderDialog(seriesItem);
    expect(screen.getByTestId('instrument-availability').textContent).toBe('Available to: All groups');
  });

  it('should name the group that owns a series', () => {
    renderDialog({ ...seriesItem, availability: { kind: 'group', name: 'Clinic A' } });
    expect(screen.getByTestId('instrument-availability').textContent).toBe('Available to: Clinic A');
  });

  it('should say a series is owned by another group when that group is not named', () => {
    renderDialog({ ...seriesItem, availability: { kind: 'group', name: null } });
    expect(screen.getByTestId('instrument-availability').textContent).toBe('Available to: Another group');
  });

  it('should list the series items in order by title, numbering any whose title is unknown', () => {
    renderDialog(seriesItem);
    expect(screen.getAllByRole('listitem').map((element) => element.textContent)).toEqual([
      'Happiness Questionnaire',
      'Item 2'
    ]);
  });

  it('should count the series items in the series order label', () => {
    renderDialog(seriesItem);
    expect(detailText('Series order')).toMatch(/^Series order \(2\):/);
  });

  it('should say a series without items is empty', () => {
    renderDialog({ ...seriesItem, seriesItems: [] });
    expect(detailText('Series order')).toBe('Series order: No items in this series.');
  });

  it('should treat a series whose items are not provided as empty', () => {
    renderDialog({ ...seriesItem, seriesItems: undefined });
    expect(detailText('Series order')).toBe('Series order: No items in this series.');
  });

  it('should omit the series order row for a scalar instrument', () => {
    renderDialog(scalarItem);
    expect(detailText('Series order')).toBeUndefined();
  });

  it('should fetch the bundle of the instrument once the form is previewed', () => {
    renderDialog(scalarItem);
    previewForm();
    expect(bundle.useInstrumentBundle).toHaveBeenLastCalledWith('instrument-1');
  });

  it('should replace the details with the form when the form is previewed', () => {
    renderDialog(scalarItem);
    previewForm();
    expect(detailText('Kind')).toBeUndefined();
  });

  it('should show a spinner while the bundle loads', () => {
    bundle.state = { isError: false, isLoading: true };
    renderDialog(scalarItem);
    previewForm();
    expect(screen.getByRole('dialog').querySelector('.animate-spinner')).toBeTruthy();
  });

  it('should explain that the preview failed when the bundle cannot be loaded', () => {
    bundle.state = { isError: true, isLoading: false };
    renderDialog(scalarItem);
    previewForm();
    expect(screen.getByText('Failed to load instrument preview.')).toBeTruthy();
  });

  it('should render the loaded bundle with a preview submit label', () => {
    bundle.state = { data: { id: 'instrument-1' }, isError: false, isLoading: false };
    renderDialog(scalarItem);
    previewForm();
    expect(screen.getByTestId('instrument-renderer').textContent).toBe('Preview Submit');
  });

  it('should keep the preview open when it is submitted, since a preview creates no record', () => {
    bundle.state = { data: { id: 'instrument-1' }, isError: false, isLoading: false };
    const onClose = renderDialog(scalarItem);
    previewForm();
    fireEvent.click(screen.getByTestId('instrument-renderer'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should close when the user dismisses the dialog', () => {
    const onClose = renderDialog(scalarItem);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

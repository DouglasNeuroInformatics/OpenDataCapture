import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { licenses } from '@opendatacapture/licenses';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentCard } from '../InstrumentCard';

import '@/services/i18n';

const formInstrument: TranslatedInstrumentInfo = {
  ...unilingualFormInstrument.instance,
  supportedLanguages: ['en', 'fr']
};

const seriesInstrumentInfo: TranslatedInstrumentInfo = {
  __runtimeVersion: 1,
  details: { description: 'A series instrument', license: 'UNLICENSED', title: 'Series Instrument' },
  id: 'series-1',
  kind: 'SERIES',
  language: 'en',
  seriesItems: [],
  supportedLanguages: ['en'],
  tags: ['Example']
};

const withDetails = (details: Partial<TranslatedInstrumentInfo['details']>): TranslatedInstrumentInfo => ({
  ...formInstrument,
  details: { ...formInstrument.details, ...details }
});

const renderCard = (
  instrument: TranslatedInstrumentInfo,
  props: { highlighted?: boolean; onClick?: () => void } = {}
) => {
  render(<InstrumentCard instrument={instrument} onClick={props.onClick ?? vi.fn()} {...props} />);
  return screen.getByTestId(`instrument-card-${instrument.id}`);
};

/** The text of the row whose label starts with `label`, or undefined when that row is not rendered. */
const rowText = (label: string) =>
  screen
    .queryAllByText(`${label}:`, { exact: false, selector: 'span' })
    .map((element) => element.parentElement?.textContent)
    .at(0);

const openLicenseTooltip = () => {
  fireEvent.focus(screen.getByRole('button', { name: '' }));
};

describe('InstrumentCard', () => {
  beforeEach(() => {
    void i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should show the instrument title as its heading', () => {
    renderCard(formInstrument);
    expect(screen.getByRole('heading').textContent).toBe('Unilingual Form');
  });

  it('should select the instrument when the card is clicked', () => {
    const onClick = vi.fn();
    fireEvent.click(renderCard(formInstrument, { onClick }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should ring the card when it is highlighted, so keyboard navigation shows which card Enter opens', () => {
    expect([...renderCard(formInstrument, { highlighted: true }).classList]).toContain('ring-2');
  });

  it('should not ring the card when it is not highlighted', () => {
    expect([...renderCard(formInstrument).classList]).not.toContain('ring-2');
  });

  it('should list the authors separated by commas', () => {
    renderCard(formInstrument);
    expect(rowText('Authors')).toBe('Authors: Jane Doe, John Smith');
  });

  it('should omit the authors row when the instrument names no authors', () => {
    renderCard(withDetails({ authors: undefined }));
    expect(rowText('Authors')).toBeUndefined();
  });

  it('should show the edition of a scalar instrument', () => {
    renderCard(formInstrument);
    expect(rowText('Edition')).toBe('Edition: 1');
  });

  it('should omit the edition row for a series, which has no edition', () => {
    renderCard(seriesInstrumentInfo);
    expect(rowText('Edition')).toBeUndefined();
  });

  it('should name each supported language in its own language', () => {
    renderCard(formInstrument);
    expect(rowText('Languages')).toBe('Languages: English, Français');
  });

  it('should show the name of the instrument license', () => {
    renderCard(formInstrument);
    expect(rowText('License')).toBe('License: Apache License 2.0');
  });

  // The license catalog ships with the client, so an instrument stored by a newer server can carry a
  // license identifier the client does not know.
  it('should label a license missing from the catalog as NA', () => {
    vi.spyOn(licenses, 'get').mockReturnValue(undefined);
    renderCard(formInstrument);
    expect(rowText('License')).toBe('License: NA');
  });

  it('should explain that an open-source license is free and open source', () => {
    renderCard(formInstrument);
    openLicenseTooltip();
    expect(screen.getByRole('tooltip').textContent).toBe('This is a free and open-source license');
  });

  it('should warn that a proprietary license is not free and open source', () => {
    renderCard(withDetails({ license: 'UNLICENSED' }));
    openLicenseTooltip();
    expect(screen.getByRole('tooltip').textContent).toBe('This is not a free and open source license');
  });

  it('should warn that a license missing from the catalog is not free and open source', () => {
    vi.spyOn(licenses, 'get').mockReturnValue(undefined);
    renderCard(formInstrument);
    openLicenseTooltip();
    expect(screen.getByRole('tooltip').textContent).toBe('This is not a free and open source license');
  });

  it('should link to the source in a new tab, so the showcase stays open', () => {
    renderCard(formInstrument);
    const link = screen.getByRole<HTMLAnchorElement>('link', { name: 'https://github.com' });
    expect(link.target).toBe('_blank');
  });

  it('should link to the reference when the instrument has one', () => {
    renderCard(withDetails({ referenceUrl: 'https://example.org/paper' }));
    expect(rowText('Reference Link')).toBe('Reference Link: https://example.org/paper');
  });

  it('should omit the reference row when the instrument has no reference', () => {
    renderCard(formInstrument);
    expect(rowText('Reference Link')).toBeUndefined();
  });

  it('should list the tags separated by commas', () => {
    renderCard(formInstrument);
    expect(rowText('Tags')).toBe('Tags: Example, Preferences');
  });

  it('should omit the tags row when the instrument has no tags', () => {
    renderCard({ ...formInstrument, tags: [] });
    expect(rowText('Tags')).toBeUndefined();
  });
});

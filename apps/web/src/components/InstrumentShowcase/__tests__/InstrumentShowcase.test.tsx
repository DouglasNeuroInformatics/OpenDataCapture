import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MotionGlobalConfig } from 'motion/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstrumentShowcase } from '../InstrumentShowcase';

// Initialises the shared libui translator, which the showcase's controls read on render.
import '@/services/i18n';

type InstrumentFixture = {
  id: string;
  kind: 'FORM' | 'INTERACTIVE' | 'SERIES';
  supportedLanguages: TranslatedInstrumentInfo['supportedLanguages'];
  tags: string[];
  title: string;
};

const createInstrument = ({
  id,
  kind,
  supportedLanguages,
  tags,
  title
}: InstrumentFixture): TranslatedInstrumentInfo => {
  const base = {
    __runtimeVersion: 1,
    details: { description: `${title} description`, license: 'Apache-2.0', title },
    id,
    language: 'en',
    supportedLanguages,
    tags
  } as const;
  return kind === 'SERIES' ? { ...base, kind, seriesItems: [] } : { ...base, internal: { edition: 1, name: id }, kind };
};

const beta = createInstrument({
  id: 'beta',
  kind: 'FORM',
  supportedLanguages: ['en', 'fr'],
  tags: ['Mood', 'Anxiety'],
  title: 'Beta Questionnaire'
});
const alpha = createInstrument({
  id: 'alpha',
  kind: 'INTERACTIVE',
  supportedLanguages: ['en'],
  tags: ['Memory'],
  title: 'Alpha Task'
});
const gamma = createInstrument({
  id: 'gamma',
  kind: 'SERIES',
  supportedLanguages: ['fr'],
  tags: ['Mood'],
  title: 'Gamma Series'
});

const instruments = [beta, gamma, alpha];

const renderShowcase = (data: TranslatedInstrumentInfo[] = instruments) => {
  const onSelect = vi.fn();
  render(<InstrumentShowcase data={data} onSelect={onSelect} />);
  return onSelect;
};

const cardIds = () =>
  screen.getAllByTestId(/^instrument-card-/).map((card) => card.dataset.testid?.replace('instrument-card-', ''));

/** Even with animations skipped, an exiting card unmounts only once its exit settles. */
const expectCardIds = async (ids: string[]) => {
  await waitFor(() => expect(cardIds()).toEqual(ids));
};

const isHighlighted = (instrument: TranslatedInstrumentInfo) =>
  screen.getByTestId(`instrument-card-${instrument.id}`).classList.contains('ring-2');

const pressKey = (key: string) => fireEvent.keyDown(screen.getByRole('searchbox'), { key });

const openFilter = (testId: string) => {
  fireEvent.keyDown(within(screen.getByTestId(testId)).getByRole('button'), { key: 'Enter' });
};

const toggleFilterOption = (testId: string, label: string) => {
  openFilter(testId);
  fireEvent.click(screen.getByRole('menuitemcheckbox', { name: label }));
};

const search = (term: string) => {
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: term } });
};

describe('InstrumentShowcase', () => {
  // Without this, a filtered-out card stays mounted for its 1.5 second exit animation.
  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });

  afterAll(() => {
    MotionGlobalConfig.skipAnimations = false;
  });

  beforeEach(() => {
    void i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should not submit the wrapping search form when Enter is pressed with no matching instruments', () => {
    render(<InstrumentShowcase data={[]} onSelect={vi.fn()} />);
    const searchBar = screen.getByRole('searchbox');
    // fireEvent returns false when the event was canceled (preventDefault called). Leaving it
    // un-cancelled lets the SearchBar form submit and reload the app back to the login page.
    expect(fireEvent.keyDown(searchBar, { key: 'Enter' })).toBe(false);
  });

  // happy-dom computes no layout, so the responsive stacking is asserted through its utility classes;
  // testing/src/specs/accessible-instruments.spec.ts measures the rendered result at phone width.
  it('should stack the search bar above the filters below the lg breakpoint, so a phone gives it the full width', () => {
    render(<InstrumentShowcase data={[]} onSelect={vi.fn()} />);
    const searchBar = screen.getByTestId('instrument-search-bar');
    expect([...searchBar.classList]).toContain('w-full');
    expect([...searchBar.parentElement!.classList]).toEqual(expect.arrayContaining(['flex-col', 'lg:flex-row']));
  });

  it('should not select anything when Enter is pressed with no matching instruments', () => {
    const onSelect = vi.fn();
    render(<InstrumentShowcase data={[]} onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should list the instruments alphabetically by title', () => {
    renderShowcase();
    expect(cardIds()).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('should select an instrument when its card is clicked', () => {
    const onSelect = renderShowcase();
    fireEvent.click(screen.getByTestId('instrument-card-gamma'));
    expect(onSelect).toHaveBeenCalledWith(gamma);
  });

  it('should keep only the instruments whose title matches the search, ignoring case', async () => {
    renderShowcase();
    search('questionNAIRE');
    await expectCardIds(['beta']);
  });

  it('should keep the instruments whose tags match the search, so a domain finds its instruments', async () => {
    renderShowcase();
    search('mood');
    await expectCardIds(['beta', 'gamma']);
  });

  it('should keep only the instruments of a selected kind', async () => {
    renderShowcase();
    toggleFilterOption('instrument-kind-filter', 'Interactive');
    await expectCardIds(['alpha']);
  });

  it('should keep only the instruments available in a selected language', async () => {
    renderShowcase();
    toggleFilterOption('instrument-language-filter', 'French');
    await expectCardIds(['beta', 'gamma']);
  });

  it('should keep only the instruments carrying a selected tag', async () => {
    renderShowcase();
    toggleFilterOption('instrument-tag-filter', 'Memory');
    await expectCardIds(['alpha']);
  });

  it('should offer each tag once, sorted, as a tag filter option', () => {
    renderShowcase();
    openFilter('instrument-tag-filter');
    expect(screen.getAllByRole('menuitemcheckbox').map((option) => option.textContent)).toEqual([
      'Anxiety',
      'Memory',
      'Mood'
    ]);
  });

  it('should highlight the first instrument, so Enter has something to open', () => {
    renderShowcase();
    expect(isHighlighted(alpha)).toBe(true);
  });

  it('should move the highlight down when ArrowDown is pressed', () => {
    renderShowcase();
    pressKey('ArrowDown');
    expect(isHighlighted(beta)).toBe(true);
  });

  it('should keep the highlight on the last instrument when ArrowDown is pressed there', () => {
    renderShowcase();
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    expect(isHighlighted(gamma)).toBe(true);
  });

  it('should move the highlight up when ArrowUp is pressed', () => {
    renderShowcase();
    pressKey('ArrowDown');
    pressKey('ArrowUp');
    expect(isHighlighted(alpha)).toBe(true);
  });

  it('should keep the highlight on the first instrument when ArrowUp is pressed there', () => {
    renderShowcase();
    pressKey('ArrowUp');
    expect(isHighlighted(alpha)).toBe(true);
  });

  it('should not cancel the arrow keys when nothing matches, so the caret still moves in the search bar', () => {
    renderShowcase([]);
    expect(pressKey('ArrowDown')).toBe(true);
  });

  it('should leave the highlight in place when another key is pressed', () => {
    renderShowcase();
    pressKey('ArrowDown');
    pressKey('a');
    expect(isHighlighted(beta)).toBe(true);
  });

  it('should select the highlighted instrument when Enter is pressed', () => {
    const onSelect = renderShowcase();
    pressKey('ArrowDown');
    pressKey('Enter');
    expect(onSelect).toHaveBeenCalledWith(beta);
  });

  it('should move the highlight back to the first match when the search changes', async () => {
    renderShowcase();
    pressKey('ArrowDown');
    pressKey('ArrowDown');
    search('a');
    await waitFor(() => expect(isHighlighted(alpha)).toBe(true));
  });

  it('should scroll the highlighted instrument into view, so keyboard navigation never leaves it offscreen', () => {
    const scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView');
    renderShowcase();
    pressKey('ArrowDown');
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(screen.getByTestId('instrument-card-beta').closest('li'));
  });
});

import type { TableColorMode } from '@opendatacapture/schemas/setup';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ColorTag, ColorTagCell } from '../ColorTagCell';

const mocks = vi.hoisted((): { tableColorMode: TableColorMode } => ({ tableColorMode: 'tags' }));

vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { tableColorMode: mocks.tableColorMode } })
}));

const COLOR = { fill: '#16a34a', text: '#15803d' };

const tag = () => screen.getByTestId('tag');

const dots = () => within(tag()).queryAllByTestId('color-tag-dot');

const label = () => screen.getByText('Active');

describe('ColorTag', () => {
  afterEach(cleanup);

  it('should draw a filled dot and leave the label in ordinary ink in tags mode', () => {
    render(<ColorTag color={COLOR} data-testid="tag" label="Active" mode="tags" />);
    expect(dots()[0]!.style.backgroundColor).toBe('#16a34a');
    expect(label().style.color).toBe('');
  });

  it('should tint the label and draw no dot in text mode', () => {
    render(<ColorTag color={COLOR} data-testid="tag" label="Active" mode="text" />);
    expect(dots()).toHaveLength(0);
    expect(label().style.color).toBe('#15803d');
  });

  it('should draw neither a dot nor a tint in none mode', () => {
    render(<ColorTag color={COLOR} data-testid="tag" label="Active" mode="none" />);
    expect(dots()).toHaveLength(0);
    expect(label().style.color).toBe('');
  });

  it('should forward data attributes, so a spec can read the state a cell carries', () => {
    render(<ColorTag color={COLOR} data-archived="true" data-testid="tag" label="Active" mode="tags" />);
    expect(tag().getAttribute('data-archived')).toBe('true');
  });
});

describe('ColorTagCell', () => {
  afterEach(cleanup);

  it('should draw in the mode the instance is set to, so one setting governs every table', () => {
    mocks.tableColorMode = 'text';
    render(<ColorTagCell color={COLOR} data-testid="tag" label="Active" />);
    expect(dots()).toHaveLength(0);
    expect(label().style.color).toBe('#15803d');
  });
});

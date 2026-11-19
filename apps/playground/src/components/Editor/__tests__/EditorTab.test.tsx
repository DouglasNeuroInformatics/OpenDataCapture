// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EditorTab } from '../EditorTab';

const store = vi.hoisted(() => ({
  state: {
    closeFile: (_filename: string) => undefined,
    selectedFilename: 'b.ts',
    selectFile: (_filename: string) => undefined
  }
}));

vi.mock('@/store', () => ({
  useAppStore: <TSelected,>(selector: (state: typeof store.state) => TSelected) => selector(store.state)
}));

describe('EditorTab', () => {
  beforeEach(() => {
    store.state.closeFile = vi.fn();
    store.state.selectFile = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it('should close its file without selecting it when its X is clicked, so closing a background tab keeps the active one', () => {
    const { container } = render(<EditorTab filename="a.ts" />);
    fireEvent.click(container.querySelector('svg')!);
    expect(store.state.closeFile).toHaveBeenCalledExactlyOnceWith('a.ts');
    expect(store.state.selectFile).not.toHaveBeenCalled();
  });

  it('should select its file when clicked anywhere but its X', () => {
    render(<EditorTab filename="a.ts" />);
    fireEvent.click(screen.getByText('a.ts'));
    expect(store.state.selectFile).toHaveBeenCalledExactlyOnceWith('a.ts');
    expect(store.state.closeFile).not.toHaveBeenCalled();
  });

  it('should mark only the tab of the selected file as current', () => {
    render(
      <>
        <EditorTab filename="a.ts" />
        <EditorTab filename="b.ts" />
      </>
    );
    const [first, second] = screen.getAllByRole('button');
    expect(first!.getAttribute('aria-current')).toBe('false');
    expect(second!.getAttribute('aria-current')).toBe('true');
  });
});

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/datahub/index';

import '@/services/i18n';

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => vi.fn()
}));
vi.mock('@/hooks/useSubjectsQuery', () => ({
  subjectsQueryOptions: vi.fn(),
  useSubjectsQuery: () => ({ data: [] })
}));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: { currentGroup: null; currentUser: null }) => unknown) =>
    selector({ currentGroup: null, currentUser: null })
}));

describe('data hub table controls', () => {
  beforeEach(() => {
    // The toggles call `Route.useNavigate()`, which warns outside a RouterProvider; no navigation happens here.
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // happy-dom computes no layout, so the wrapping is asserted through its utility classes;
  // testing/src/specs/datahub.spec.ts measures the rendered result at phone width.
  it('should let the controls wrap below the md breakpoint, so a phone never pushes Export off screen', () => {
    const Component = Route.options.component!;
    render(<Component />);
    const controls = screen.getByTestId('subject-lookup-search-button').parentElement!;
    expect([...controls.classList]).toEqual(expect.arrayContaining(['flex-wrap', 'md:flex-nowrap']));
  });
});

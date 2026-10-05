import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstrumentInfoById } from '../useInstrumentInfoById';

type InfoQueryParams = { allEditions?: boolean; kind?: string; subjectId?: string };

const mocks = vi.hoisted(() => ({
  data: undefined as undefined | { details: { title: string }; id: string; kind: string }[],
  /** What the hook asked the catalog for, captured so the slice can be asserted */
  params: undefined as InfoQueryParams | undefined
}));

vi.mock('@/hooks/useInstrumentInfoQuery', () => ({
  useInstrumentInfoQuery: ({ params }: { params?: InfoQueryParams }) => {
    mocks.params = params;
    return { data: mocks.data };
  }
}));

describe('useInstrumentInfoById', () => {
  beforeEach(() => {
    mocks.data = undefined;
    mocks.params = undefined;
  });

  afterEach(cleanup);

  it('should key every instrument by its id, carrying the kind beside the title', () => {
    mocks.data = [
      { details: { title: 'Happiness Questionnaire' }, id: 'hq-1', kind: 'FORM' },
      { details: { title: 'Stroop Task' }, id: 'stroop-1', kind: 'INTERACTIVE' }
    ];
    const { result } = renderHook(() => useInstrumentInfoById());
    expect(result.current).toStrictEqual({
      'hq-1': { kind: 'FORM', title: 'Happiness Questionnaire' },
      'stroop-1': { kind: 'INTERACTIVE', title: 'Stroop Task' }
    });
  });

  // A series' member list reads the kind off this map, so an INTERACTIVE member must not be
  // reported as a form.
  it('should report a non-form kind as itself', () => {
    mocks.data = [{ details: { title: 'Upload' }, id: 'file-1', kind: 'FILE' }];
    const { result } = renderHook(() => useInstrumentInfoById());
    expect(result.current['file-1']?.kind).toBe('FILE');
  });

  it('should pass the requested slice of the catalog straight through to the query', () => {
    renderHook(() => useInstrumentInfoById({ kind: 'SERIES' }));
    expect(mocks.params).toStrictEqual({ kind: 'SERIES' });
  });

  // The hook is read during the first render, before the query settles, so an unresolved query has
  // to be an empty map rather than undefined.
  it('should be an empty map while the catalog has not loaded', () => {
    const { result } = renderHook(() => useInstrumentInfoById());
    expect(result.current).toStrictEqual({});
  });
});

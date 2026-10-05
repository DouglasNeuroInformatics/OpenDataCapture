import { InstrumentInterpreter } from '@opendatacapture/instrument-interpreter';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useInstrumentInterpreter } from '../useInstrumentInterpreter';

describe('useInstrumentInterpreter', () => {
  it('should provide an instrument interpreter', () => {
    const { result } = renderHook(() => useInstrumentInterpreter());
    expect(result.current).toBeInstanceOf(InstrumentInterpreter);
  });

  it('should keep the same interpreter across renders, so effects depending on it do not refire', () => {
    const { rerender, result } = renderHook(() => useInstrumentInterpreter());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

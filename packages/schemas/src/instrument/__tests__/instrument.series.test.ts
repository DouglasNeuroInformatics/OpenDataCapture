import { seriesInstrument } from '@opendatacapture/instrument-stubs/series';
import { describe, expect, it } from 'vitest';

import { $SeriesInstrument } from '../instrument.series.js';

describe('$SeriesInstrument', () => {
  it('should successfully parse a valid series instrument', () => {
    expect($SeriesInstrument.safeParse(seriesInstrument.instance).success).toBe(true);
  });

  it('should accept a function as the terminate param', () => {
    const instance = {
      ...seriesInstrument.instance,
      content: {
        items: [{ edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' }],
        params: { terminate: () => true }
      }
    };
    expect($SeriesInstrument.safeParse(instance).success).toBe(true);
  });

  it('should reject a non-function terminate param', () => {
    const instance = {
      ...seriesInstrument.instance,
      content: {
        items: [{ edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' }],
        params: { terminate: 'nope' }
      }
    };
    expect($SeriesInstrument.safeParse(instance).success).toBe(false);
  });
});

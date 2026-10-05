import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { defineInstrument, defineSeriesInstrument } from '../define.js';

import type { InstrumentDef } from '../define.js';

const details = {
  description: 'A questionnaire about happiness.',
  license: 'Apache-2.0',
  title: 'Happiness Questionnaire'
} as const;

const $HappinessData = z.object({ overallHappiness: z.number() });

describe('defineInstrument', () => {
  it('should stamp runtime version 1 onto the definition it was given', () => {
    const def: InstrumentDef<'FORM', 'en', typeof $HappinessData> = {
      content: {
        overallHappiness: { kind: 'number', label: 'Overall Happiness', variant: 'input' }
      },
      details,
      internal: { edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' },
      kind: 'FORM',
      language: 'en',
      measures: {},
      tags: ['Well-Being'],
      validationSchema: $HappinessData
    };
    const instrument = defineInstrument(def);
    expect(instrument).toBe(def);
    expect(instrument.__runtimeVersion).toBe(1);
  });
});

describe('defineSeriesInstrument', () => {
  it('should stamp runtime version 1 onto the definition while keeping its items', () => {
    const instrument = defineSeriesInstrument({
      content: [{ edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' }],
      details,
      kind: 'SERIES',
      language: 'en',
      tags: ['Well-Being']
    });
    expect(instrument.__runtimeVersion).toBe(1);
    expect(instrument.content).toEqual([{ edition: 1, name: 'HAPPINESS_QUESTIONNAIRE' }]);
  });
});

import { beforeAll, describe, expect, it } from 'bun:test';

import { HQ_SOURCE } from '@open-data-capture/instruments';

import { InstrumentTransformer } from '.';

describe('InstrumentTransformer', () => {
  let transformer: InstrumentTransformer;

  beforeAll(() => {
    transformer = new InstrumentTransformer();
  });

  it('should successfully transpile the happiness questionnaire', async () => {
    const bundle = await transformer.generateBundle(HQ_SOURCE);
    expect(bundle).toBeDefined();
  });
});

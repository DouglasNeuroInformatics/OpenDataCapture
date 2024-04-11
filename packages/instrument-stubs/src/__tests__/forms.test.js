import { describe, expect, it } from 'vitest';

import { bilingualFormInstrument, unilingualFormInstrument } from '../forms.js';

describe('unilingualFormInstrument', () => {
  it('should be defined', () => {
    expect(unilingualFormInstrument).toBeDefined();
  });
});

describe('bilingualFormInstrument', () => {
  it('should be defined', () => {
    expect(bilingualFormInstrument).toBeDefined();
  });
});

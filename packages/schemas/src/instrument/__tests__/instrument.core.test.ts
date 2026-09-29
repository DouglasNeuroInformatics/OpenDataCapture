import { bilingualFileInstrument } from '@opendatacapture/instrument-stubs/file';
import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import { describe, expect, it } from 'vitest';

import { $AnyInstrument, $AnyScalarInstrument } from '../instrument.core.js';

describe('$AnyScalarInstrument', () => {
  it('should parse a multilingual form instrument', () => {
    expect($AnyScalarInstrument.safeParse(bilingualFormInstrument.instance).success).toBe(true);
  });
  it('should parse a unilingual form instrument', () => {
    expect($AnyScalarInstrument.safeParse(unilingualFormInstrument.instance).success).toBe(true);
  });
  it('should parse a interactive instrument', () => {
    expect($AnyScalarInstrument.safeParse(interactiveInstrument.instance).success).toBe(true);
  });
});

describe('$AnyInstrument', () => {
  it.each([
    ['form', unilingualFormInstrument.instance, unilingualFormInstrument.instance.measures?.hasNegativeFavoriteNumber],
    [
      'file',
      bilingualFileInstrument.instance,
      { kind: 'computed', label: { en: 'File Count', fr: 'Nombre de fichiers' }, value: () => 1 }
    ]
  ])(
    'should keep a computed measure marked visible on a %s instrument, so a summary that hides measures by default still shows it',
    (_, instance, measure) => {
      const result = $AnyInstrument.safeParse({
        ...instance,
        measures: { total: { ...measure, visibility: 'visible' } }
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('measures.total.visibility', 'visible');
    }
  );
});

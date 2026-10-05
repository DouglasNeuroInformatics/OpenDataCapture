import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { cleanup, renderHook } from '@testing-library/react';
import { omit } from 'lodash-es';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { useMeasureOptions } from '../useMeasureOptions';

/** The unilingual stub, retyped with the given content and measures, since its own are typed to its data. */
function formInstrument({
  content = unilingualFormInstrument.instance.content,
  measures
}: Partial<Pick<AnyUnilingualFormInstrument, 'content'>> &
  Pick<AnyUnilingualFormInstrument, 'measures'>): AnyUnilingualFormInstrument {
  return {
    ...omit(unilingualFormInstrument.instance, ['content', 'measures', 'validationSchema']),
    content,
    measures,
    validationSchema: z.object({})
  };
}

function measureOptionsFor(instrument: AnyUnilingualFormInstrument | null) {
  return renderHook(() => useMeasureOptions(instrument)).result.current;
}

describe('useMeasureOptions', () => {
  afterEach(cleanup);

  it('should offer no measures before an instrument is loaded', () => {
    expect(measureOptionsFor(null)).toEqual([]);
  });

  it('should label a computed measure with its own label', () => {
    const instrument = formInstrument({
      measures: { isNegative: { kind: 'computed', label: 'Is Negative', value: () => false } }
    });
    expect(measureOptionsFor(instrument)).toEqual([{ key: 'isNegative', label: 'Is Negative' }]);
  });

  it('should label a constant measure without a label of its own with its field label', () => {
    const instrument = formInstrument({
      measures: { favoriteNumber: { kind: 'const', ref: 'favoriteNumber' } }
    });
    expect(measureOptionsFor(instrument)).toEqual([{ key: 'favoriteNumber', label: 'Favorite Number' }]);
  });

  it('should prefer the label a constant measure declares over its field label', () => {
    const instrument = formInstrument({
      measures: { favoriteNumber: { kind: 'const', label: 'Number', ref: 'favoriteNumber' } }
    });
    expect(measureOptionsFor(instrument)).toEqual([{ key: 'favoriteNumber', label: 'Number' }]);
  });

  it('should label a constant measure on a dynamic field with the label that field renders', () => {
    const instrument = formInstrument({
      content: {
        reason: {
          deps: [],
          kind: 'dynamic',
          render: () => ({ kind: 'string', label: 'Reason', variant: 'textarea' })
        }
      },
      measures: { reason: { kind: 'const', ref: 'reason' } }
    });
    expect(measureOptionsFor(instrument)).toEqual([{ key: 'reason', label: 'Reason' }]);
  });

  it('should omit a constant measure on a dynamic field that renders nothing without data, since it has no label', () => {
    const instrument = formInstrument({
      measures: { reasonFavoriteNumberIsNegative: { kind: 'const', ref: 'reasonFavoriteNumberIsNegative' } }
    });
    expect(measureOptionsFor(instrument)).toEqual([]);
  });

  it('should find the fields of a form whose content is split into groups', () => {
    const instrument = formInstrument({
      content: [
        { kind: 'block', render: () => 'Introduction' },
        { fields: { favoriteNumber: { kind: 'number', label: 'Favorite Number', variant: 'input' } }, title: 'Numbers' }
      ],
      measures: { favoriteNumber: { kind: 'const', ref: 'favoriteNumber' } }
    });
    expect(measureOptionsFor(instrument)).toEqual([{ key: 'favoriteNumber', label: 'Favorite Number' }]);
  });
});

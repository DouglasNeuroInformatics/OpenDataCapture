import { LoggingService } from '@douglasneuroinformatics/libnest';
import { MockFactory } from '@douglasneuroinformatics/libnest/testing';
import type { MockedInstance } from '@douglasneuroinformatics/libnest/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { InstrumentMeasures } from '@opendatacapture/runtime-core';
import { beforeEach, describe, expect, it } from 'vitest';

import { InstrumentMeasuresService } from '../instrument-measures.service';

describe('InstrumentMeasuresService', () => {
  let instrumentMeasuresService: InstrumentMeasuresService;
  let loggingService: MockedInstance<LoggingService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [InstrumentMeasuresService, MockFactory.createForService(LoggingService)]
    }).compile();
    instrumentMeasuresService = moduleRef.get(InstrumentMeasuresService);
    loggingService = moduleRef.get(LoggingService);
  });

  describe('computeMeasures', () => {
    it('should compute each measure from the data, keyed by measure name', () => {
      const measures = {
        doubled: { kind: 'computed', label: 'Doubled', value: (data: { score: number }) => data.score * 2 },
        score: { kind: 'const', ref: 'score' }
      } as const;
      expect(instrumentMeasuresService.computeMeasures(measures, { score: 21 })).toEqual({ doubled: 42, score: 21 });
    });

    it('should return no measures when the instrument defines none', () => {
      expect(instrumentMeasuresService.computeMeasures({}, { score: 21 })).toEqual({});
    });

    it('should leave a constant measure undefined when its ref is absent from the data', () => {
      expect(instrumentMeasuresService.computeMeasures({ score: { kind: 'const', ref: 'score' } }, {})).toEqual({
        score: undefined
      });
    });

    it('should reject a constant measure on non-object data, naming the measure by its string label', () => {
      const measures = { score: { kind: 'const', label: 'Total Score', ref: 'score' } } as const;
      expect(() => instrumentMeasuresService.computeMeasures(measures, 5)).toThrow(
        new InternalServerErrorException("Failed to compute measure 'Total Score': data must be object'")
      );
    });

    it('should log the invalid data, so the failing record can be diagnosed', () => {
      const measures = { score: { kind: 'const', label: 'Total Score', ref: 'score' } } as const;
      expect(() => instrumentMeasuresService.computeMeasures(measures, null)).toThrow();
      expect(loggingService.error).toHaveBeenCalledWith({ data: null, message: 'Invalid Data' });
    });

    it('should name the measure by its English label when the label is translated', () => {
      const measures = {
        score: { kind: 'const', label: { en: 'Total Score', fr: 'Score total' }, ref: 'score' }
      } as const;
      expect(() => instrumentMeasuresService.computeMeasures(measures, 'not an object')).toThrow(
        "Failed to compute measure 'Total Score'"
      );
    });

    it('should fall back to the French label for an instrument written only in French', () => {
      const measures: InstrumentMeasures<{ score: number }, 'fr'[]> = {
        score: { kind: 'const', label: { fr: 'Score total' }, ref: 'score' }
      };
      // The parameter is typed for every language, so it cannot express a French-only label set.
      expect(() => instrumentMeasuresService.computeMeasures(measures as InstrumentMeasures, false)).toThrow(
        "Failed to compute measure 'Score total'"
      );
    });

    it('should still reject invalid data for a constant measure without a label', () => {
      expect(() => instrumentMeasuresService.computeMeasures({ score: { kind: 'const', ref: 'score' } }, 0)).toThrow(
        InternalServerErrorException
      );
    });
  });
});

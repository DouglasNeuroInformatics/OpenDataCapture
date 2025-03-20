import { LoggingService } from '@douglasneuroinformatics/libnest';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type {
  FormInstrument,
  InstrumentMeasure,
  InstrumentMeasures,
  InstrumentMeasureValue,
  Json
} from '@opendatacapture/runtime-core';
import type { Prisma } from '@prisma/client';
import { match } from 'ts-pattern';

@Injectable()
export class InstrumentMeasuresService {
  constructor(private readonly loggingService: LoggingService) {}

  computeMeasures(measures: InstrumentMeasures, data: FormInstrument.Data | Json | Prisma.JsonValue) {
    const computedMeasures: { [key: string]: InstrumentMeasureValue } = {};
    for (const key in measures) {
      computedMeasures[key] = this.computeMeasure(measures[key]!, data);
    }
    return computedMeasures;
  }

  private computeMeasure(measure: InstrumentMeasure, data: FormInstrument.Data | Json | Prisma.JsonValue) {
    return match(measure)
      .with({ kind: 'computed' }, (measure) => {
        return measure.value(data);
      })
      .with({ kind: 'const' }, (measure) => {
        if (!(data && typeof data === 'object')) {
          this.loggingService.error({ data, message: 'Invalid Data' });
          const label = typeof measure.label === 'string' ? measure.label : (measure.label?.en ?? measure.label?.fr)!;
          throw new InternalServerErrorException(`Failed to compute measure '${label}': data must be object'`);
        }
        return Reflect.get(data, measure.ref) as InstrumentMeasureValue;
      })
      .exhaustive();
  }
}

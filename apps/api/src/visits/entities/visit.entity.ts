import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import type { Subject, Visit } from '@open-data-capture/types';

@EntitySchema()
export class VisitEntity implements Visit {
  static readonly modelName = 'Visit';
  dateAssessed: Date;
  subject: Subject;
}

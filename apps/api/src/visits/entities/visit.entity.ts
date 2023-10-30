import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop } from '@nestjs/mongoose';
import type { Subject } from '@open-data-capture/common/subject';
import type { Visit } from '@open-data-capture/common/visit';
import { Schema as MongooseSchema } from 'mongoose';

import { SubjectEntity } from '@/subjects/entities/subject.entity';

@EntitySchema<Visit>()
export class VisitEntity {
  static readonly modelName = 'Visit';

  @Prop({ required: true, type: Object })
  date: Date;

  @Prop({ ref: SubjectEntity.modelName, required: true, type: MongooseSchema.Types.ObjectId })
  subject: Subject;
}

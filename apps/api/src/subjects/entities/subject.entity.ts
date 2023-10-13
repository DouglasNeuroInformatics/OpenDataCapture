import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Sex, Subject } from '@open-data-capture/types';
import { type HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { GroupEntity } from '@/groups/entities/group.entity';

@Schema({ timestamps: true })
export class SubjectEntity implements Subject {
  static readonly modelName = 'Subject';

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: false })
  firstName?: string;

  @Prop({ default: [], required: false, type: [{ ref: GroupEntity.name, type: MongooseSchema.Types.ObjectId }] })
  groups: GroupEntity[];

  @Prop({ required: true })
  identifier: string;

  @Prop({ required: false })
  lastName?: string;

  @Prop({ enum: ['male', 'female'] satisfies Sex[], required: true, type: String })
  sex: Sex;
}

export type SubjectDocument = HydratedDocument<SubjectEntity>;

export const SubjectSchema = SchemaFactory.createForClass(SubjectEntity);

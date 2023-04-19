import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { type Sex, Subject } from '@douglasneuroinformatics/common';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { GroupEntity } from '@/groups/entities/group.entity';

@Schema({ strict: 'throw', timestamps: true })
export class SubjectEntity implements Subject {
  static readonly modelName = 'Subject';

  @Prop({ required: true })
  identifier: string;

  @Prop({ required: false })
  firstName?: string;

  @Prop({ required: false })
  lastName?: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ enum: ['male', 'female'] satisfies Sex[], required: true, type: String })
  sex: Sex;

  @Prop({ required: false, default: [], type: [{ ref: GroupEntity.name, type: MongooseSchema.Types.ObjectId }] })
  groups: GroupEntity[];
}

export type SubjectDocument = HydratedDocument<SubjectEntity>;

export const SubjectSchema = SchemaFactory.createForClass(SubjectEntity);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

import type { GroupInterface } from '../groups.types';

@Schema({ strict: true, timestamps: true })
export class Group implements GroupInterface {
  static readonly modelName = 'Group';

  @Prop({ required: true, unique: true })
  name: string;
}

export type GroupDocument = HydratedDocument<Group>;

export const GroupSchema = SchemaFactory.createForClass(Group);

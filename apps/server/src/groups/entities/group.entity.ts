import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Group } from '@ddcp/common/groups';
import { HydratedDocument } from 'mongoose';

@Schema({ strict: 'throw', timestamps: true })
export class GroupEntity implements Group {
  @Prop({ required: true, unique: true })
  name: string;
}

export type GroupDocument = HydratedDocument<GroupEntity>;

export const GroupSchema = SchemaFactory.createForClass(GroupEntity);

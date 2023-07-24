import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { Group } from '@ddcp/types';
import { HydratedDocument } from 'mongoose';

@Schema({ strict: 'throw', timestamps: true })
export class GroupEntity implements Group {
  static readonly modelName = 'Group';

  @ApiProperty({ example: 'Depression Clinic' })
  @Prop({ required: true, unique: true })
  name: string;
}

export type GroupDocument = HydratedDocument<GroupEntity>;

export const GroupSchema = SchemaFactory.createForClass(GroupEntity);

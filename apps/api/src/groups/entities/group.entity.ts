import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import type { Group } from '@open-data-capture/types';
import { type HydratedDocument } from 'mongoose';

import { EntitySchema } from '@/core/decorators/entity-schema.decorator';

@EntitySchema<Group>()
export class GroupEntity {
  static modelName = 'Group';

  @ApiProperty({ example: 'Depression Clinic' })
  @Prop({ required: true, unique: true })
  name: string;
}

export type GroupDocument = HydratedDocument<GroupEntity>;

export const GroupSchema = SchemaFactory.createForClass(GroupEntity);

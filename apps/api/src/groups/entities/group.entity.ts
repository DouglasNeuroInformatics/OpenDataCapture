import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import type { Group } from '@open-data-capture/types';
import { type HydratedDocument } from 'mongoose';

@EntitySchema<Group>()
export class GroupEntity implements Group {
  static readonly modelName = 'Group';

  @ApiProperty({ example: 'Depression Clinic' })
  @Prop({ required: true, unique: true })
  name: string;
}

export type GroupDocument = HydratedDocument<GroupEntity>;

export const GroupSchema = SchemaFactory.createForClass(GroupEntity);

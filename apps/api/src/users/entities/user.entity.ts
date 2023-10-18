import { EntitySchema } from '@douglasneuroinformatics/nestjs/core';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import type { BasePermissionLevel, Group, User } from '@open-data-capture/types';
import { Schema as MongooseSchema } from 'mongoose';

import { GroupEntity } from '@/groups/entities/group.entity';

@EntitySchema()
export class UserEntity implements User {
  static readonly modelName = 'User';

  @Prop({ enum: ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] satisfies BasePermissionLevel[], type: String })
  basePermissionLevel?: BasePermissionLevel;

  @Prop({ required: false, type: String })
  firstName?: string;

  @Prop({ required: true, type: [{ ref: GroupEntity.modelName, type: MongooseSchema.Types.ObjectId }] })
  groups: Group[];

  @Prop({ required: false, type: String })
  lastName?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  username: string;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);

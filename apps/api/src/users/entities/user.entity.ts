import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { BasePermissionLevel, User } from '@open-data-capture/types';
import { type HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { GroupEntity } from '@/groups/entities/group.entity';

@Schema({ id: true, strict: 'throw', timestamps: true, toObject: { virtuals: true } })
export class UserEntity implements User {
  static readonly modelName = 'User';

  @Prop({ enum: ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] satisfies BasePermissionLevel[], type: String })
  basePermissionLevel?: BasePermissionLevel;

  @Prop({ required: false, type: String })
  firstName?: string;

  @Prop({ required: true, type: [{ ref: GroupEntity.modelName, type: MongooseSchema.Types.ObjectId }] })
  groups: GroupEntity[];

  @Prop({ required: false, type: String })
  lastName?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  username: string;
}

export type UserDocument = HydratedDocument<UserEntity>;

export const UserSchema = SchemaFactory.createForClass(UserEntity);

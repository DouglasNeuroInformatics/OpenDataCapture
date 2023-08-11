import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { BasePermissionLevel, User, UserPreferences } from '@ddcp/types';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { UserPreferencesSchema } from './user-preferences.entity.js';

import { GroupEntity } from '@/groups/entities/group.entity.js';

@Schema({ strict: 'throw', timestamps: true })
export class UserEntity implements User {
  static readonly modelName = 'User';

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: [{ ref: GroupEntity.modelName, type: MongooseSchema.Types.ObjectId }] })
  groups: GroupEntity[];

  @Prop({ required: false })
  isAdmin?: boolean;

  @Prop({ enum: ['ADMIN', 'GROUP_MANAGER', 'STANDARD'] satisfies BasePermissionLevel[], type: String })
  basePermissionLevel?: BasePermissionLevel;

  @Prop({ required: false, type: String })
  firstName?: string;

  @Prop({ required: false, type: String })
  lastName?: string;

  @Prop({ required: false, type: UserPreferencesSchema })
  preferences?: UserPreferences;

  @Prop({ required: true, type: Array })
  sessions: Array<{
    ipAddress?: string | null;
    time: number;
  }>;
}

export type UserDocument = HydratedDocument<UserEntity>;

export const UserSchema = SchemaFactory.createForClass(UserEntity);

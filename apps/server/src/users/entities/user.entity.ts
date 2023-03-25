import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { User, UserPreferences } from '@ddcp/common';
import { BasePermissionLevel } from '@ddcp/common/auth';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { UserPreferencesSchema } from './user-preferences.entity';

import { GroupEntity } from '@/groups/entities/group.entity';

@Schema({ strict: 'throw', timestamps: true })
export class UserEntity implements User {
  static readonly modelName = 'User';

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: [{ ref: GroupEntity.name, type: MongooseSchema.Types.ObjectId }] })
  groups: GroupEntity[];

  @Prop({ enum: ['admin', 'group-manager', 'standard'], type: String })
  basePermissionLevel?: BasePermissionLevel;

  @Prop({ required: false, type: String })
  firstName?: string;

  @Prop({ required: false, type: String })
  lastName?: string;

  @Prop({ required: false, type: UserPreferencesSchema })
  preferences?: UserPreferences;
}

export type UserDocument = HydratedDocument<UserEntity>;

export const UserSchema = SchemaFactory.createForClass(UserEntity);

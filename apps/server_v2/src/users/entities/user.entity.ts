import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BasePermissionLevel, Fingerprint, type User, type UserPreferences } from '@douglasneuroinformatics/common';
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

  @Prop({ enum: BasePermissionLevel, type: String })
  basePermissionLevel?: BasePermissionLevel;

  @Prop({ required: false, type: String })
  firstName?: string;

  @Prop({ required: false, type: String })
  lastName?: string;

  @Prop({ required: false, type: UserPreferencesSchema })
  preferences?: UserPreferences;

  @Prop({ required: true, type: Array })
  sessions: Array<{
    fingerprint?: Fingerprint | null;
    ipAddress?: string | null;
    time: number;
  }>;
}

export type UserDocument = HydratedDocument<UserEntity>;

export const UserSchema = SchemaFactory.createForClass(UserEntity);

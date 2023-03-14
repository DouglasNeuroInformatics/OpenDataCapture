import { Prop, Schema } from '@nestjs/mongoose';

import { RawRuleOf } from '@casl/ability';
import { HydratedDocument } from 'mongoose';

import { AppAbility } from '@/permissions/permissions.types';

@Schema({ strict: true, timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  permissions: RawRuleOf<AppAbility>[];

  @Prop()
  refreshToken?: string;
}

export type UserDocument = HydratedDocument<User>;

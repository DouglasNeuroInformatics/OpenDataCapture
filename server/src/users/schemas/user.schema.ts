import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { UserRole, userRoleOptions } from 'common';
import { HydratedDocument } from 'mongoose';

@Schema({ strict: true, timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: userRoleOptions, required: true, type: String })
  role: UserRole;

  @Prop()
  refreshToken?: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

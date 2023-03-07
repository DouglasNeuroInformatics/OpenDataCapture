import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

import { UserInterface, UserRole } from '../users.types';

@Schema({ strict: true, timestamps: true })
export class User implements UserInterface {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['system-admin', 'group-manager', 'standard-user'] satisfies UserRole[], required: true, type: String })
  role: UserRole;

  @Prop()
  refreshToken?: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

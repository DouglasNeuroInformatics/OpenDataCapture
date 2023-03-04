import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

@Schema({ strict: true, timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['system-admin', 'group-admin', 'standard-user'], required: true, type: String })
  role: 'system-admin' | 'group-admin' | 'standard-user';

  @Prop()
  refreshToken?: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

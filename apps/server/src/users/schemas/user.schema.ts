import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { Group } from '@/groups/schemas/group.schema';
import { BasePermissionLevel } from '@/permissions/permissions.types';

@Schema({ strict: 'throw', timestamps: true })
export class User {
  static readonly modelName = 'User';

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: [{ ref: Group.name, type: MongooseSchema.Types.ObjectId }] })
  groups: Group[];

  @Prop({ enum: ['admin', 'group-manager', 'standard'], type: String })
  basePermissionLevel?: BasePermissionLevel;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { RawRuleOf } from '@casl/ability';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { Group } from '@/groups/schemas/group.schema';
import { AppAbility } from '@/permissions/permissions.types';

@Schema({ strict: true, timestamps: true })
export class User {
  static readonly modelName = 'User';

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  permissions: RawRuleOf<AppAbility>[];

  @Prop({ required: true, type: [{ ref: Group.name, type: MongooseSchema.Types.ObjectId }] })
  groups: Group[];

  @Prop()
  refreshToken?: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

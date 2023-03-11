import { Prop, Schema } from '@nestjs/mongoose';

import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { UserInterface } from '../users.types';

import { Group } from '@/groups/entities/group.entity';

@Schema({ strict: true, timestamps: true })
export class User implements UserInterface {
  static readonly modelName = 'User';

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  isAdmin?: boolean;

  @Prop({ ref: Group.name, type: [MongooseSchema.Types.ObjectId] })
  groups?: Group[];

  @Prop()
  refreshToken?: string;
}

export type UserDocument = HydratedDocument<User>;

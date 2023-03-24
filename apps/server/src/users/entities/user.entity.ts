import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BasePermissionLevel } from '@ddcp/common/auth';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { GroupEntity } from '@/groups/entities/group.entity';

@Schema({ strict: 'throw', timestamps: true })
export class User {
  static readonly modelName = 'User';

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: [{ ref: GroupEntity.name, type: MongooseSchema.Types.ObjectId }] })
  groups: GroupEntity[];

  @Prop({ enum: ['admin', 'group-manager', 'standard'], type: String })
  basePermissionLevel?: BasePermissionLevel;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

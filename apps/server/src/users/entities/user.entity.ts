import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

import { UserKind } from '../enums/user-kind.enum';

import { Group } from '@/groups/entities/group.entity';

abstract class BaseUser {
  abstract kind: UserKind;
  username: string;
  password: string;
}

@Schema()
export class AdminUser extends BaseUser {
  kind: UserKind.Admin;
}

@Schema()
export class StandardUser extends BaseUser {
  kind: UserKind.Standard;
  //groups: Group[];
}

@Schema({ discriminatorKey: 'kind', strict: true, timestamps: true })
export class User extends BaseUser {
  @Prop({ enum: UserKind, required: true })
  kind: UserKind;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  refreshToken?: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);

export const StandardUserSchema = SchemaFactory.createForClass(StandardUser);

import { Module } from '@nestjs/common';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';

import { CreateUserCommand } from './commands/create-user.command';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

import { GroupsModule } from '@/groups/groups.module';
import { PermissionsModule } from '@/permissions/permissions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      }
    ]),
    GroupsModule,
    PermissionsModule
  ],
  controllers: [UsersController],
  providers: [CreateUserCommand, UsersRepository, UsersService],
  exports: [UsersService]
})
export class UsersModule {}

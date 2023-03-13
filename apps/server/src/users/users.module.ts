import { Module } from '@nestjs/common';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';

import { CreateUserCommand } from './commands/create-user.command';
import { AdminUser, StandardUser, User } from './entities/user.entity';
import { UserKind } from './enums/user-kind.enum';
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
        schema: SchemaFactory.createForClass(User),
        discriminators: [
          {
            name: UserKind.Admin,
            schema: SchemaFactory.createForClass(AdminUser)
          },
          {
            name: UserKind.Standard,
            schema: SchemaFactory.createForClass(StandardUser)
          }
        ]
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

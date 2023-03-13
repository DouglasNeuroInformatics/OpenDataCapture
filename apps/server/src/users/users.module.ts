import { Module } from '@nestjs/common';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';

// import { CreateUserCommand } from './commands/create-user.command';
import { AdminUser, StandardUser, User } from './entities/user.entity';
import { UserKind } from './enums/user-kind.enum';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

import { GroupsModule } from '@/groups/groups.module';

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
    GroupsModule
  ],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService]
})
export class UsersModule {}

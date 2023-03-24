import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateUserCommand } from './commands/create-user.command';
import { User, UserSchema } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

import { CryptoModule } from '@/crypto/crypto.module';
import { GroupsModule } from '@/groups/groups.module';
import { PermissionsModule } from '@/permissions/permissions.module';

@Module({
  imports: [
    CryptoModule,
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

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CreateUserCommand } from './commands/create-user.command';
import { UserEntity, UserSchema } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

import { AbilityModule } from '@/ability/ability.module';
import { CryptoModule } from '@/crypto/crypto.module';
import { GroupsModule } from '@/groups/groups.module';

@Module({
  imports: [
    CryptoModule,
    MongooseModule.forFeature([
      {
        name: UserEntity.modelName,
        schema: UserSchema
      }
    ]),
    GroupsModule,
    AbilityModule
  ],
  controllers: [UsersController],
  providers: [CreateUserCommand, UsersRepository, UsersService],
  exports: [UsersService]
})
export class UsersModule {}

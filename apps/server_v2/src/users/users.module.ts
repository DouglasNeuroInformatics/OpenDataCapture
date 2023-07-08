import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserEntity, UserSchema } from './entities/user.entity.js';
import { UsersController } from './users.controller.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

import { AbilityModule } from '@/ability/ability.module.js';
import { CryptoModule } from '@/crypto/crypto.module.js';
import { GroupsModule } from '@/groups/groups.module.js';

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
  providers: [UsersRepository, UsersService],
  exports: [UsersService]
})
export class UsersModule {}

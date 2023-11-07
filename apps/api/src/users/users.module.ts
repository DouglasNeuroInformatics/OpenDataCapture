import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GroupsModule } from '@/groups/groups.module';

import { UserEntity, UserSchema } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [
    GroupsModule,
    MongooseModule.forFeature([
      {
        name: UserEntity.modelName,
        schema: UserSchema
      }
    ])
  ],
  providers: [UsersRepository, UsersService]
})
export class UsersModule {}

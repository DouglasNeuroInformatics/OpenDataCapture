import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserEntity, UserSchema } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { AbilityModule } from '@/ability/ability.module';
import { GroupsModule } from '@/groups/groups.module';

@Module({
  imports: [
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
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}

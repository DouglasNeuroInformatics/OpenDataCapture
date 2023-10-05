import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AbilityModule } from '@/ability/ability.module';
import { GroupsModule } from '@/groups/groups.module';

import { UserEntity, UserSchema } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
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
  providers: [UsersService]
})
export class UsersModule {}

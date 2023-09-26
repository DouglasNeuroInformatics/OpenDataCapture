import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { createMongoAbility } from '@casl/ability';
import { AppAbility, SetupState } from '@open-data-capture/types';
import mongoose from 'mongoose';

import { DemoService } from './demo.service';
import { CreateAdminDto, SetupDto } from './dto/setup.dto';

import { UserEntity } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';

@Injectable()
export class SetupService {
  private readonly adminAbility = createMongoAbility<AppAbility>([{ action: 'manage', subject: 'all' }]);

  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly demoService: DemoService,
    private readonly usersService: UsersService
  ) {}

  async initApp({ admin, initDemo }: SetupDto): Promise<void> {
    if (await this.isSetup()) {
      throw new ForbiddenException();
    }
    await this.dropDatabase();
    await this.createAdmin(admin);
    if (initDemo) {
      await this.demoService.init();
    }
  }

  async dropDatabase(): Promise<void> {
    return this.connection.dropDatabase();
  }

  async createAdmin(admin: CreateAdminDto): Promise<UserEntity> {
    return this.usersService.create({ ...admin, basePermissionLevel: 'ADMIN' }, this.adminAbility);
  }

  async getState(): Promise<SetupState> {
    return { isSetup: await this.isSetup() };
  }

  private async isSetup(): Promise<boolean> {
    const collections = await this.connection.db.listCollections().toArray();
    for (const collection of collections) {
      const count = await this.connection.collection(collection.name).countDocuments();
      if (count > 0) {
        return true;
      }
    }
    return false;
  }
}

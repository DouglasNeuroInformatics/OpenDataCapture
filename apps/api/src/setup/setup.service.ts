import { createMongoAbility } from '@casl/ability';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { AppAbility, SetupState } from '@open-data-capture/types';
import mongoose from 'mongoose';

import { UserEntity } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';

import { DemoService } from './demo.service';
import { type Admin, SetupDto } from './dto/setup.dto';

@Injectable()
export class SetupService {
  private readonly adminAbility = createMongoAbility<AppAbility>([{ action: 'manage', subject: 'all' }]);

  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly demoService: DemoService,
    private readonly usersService: UsersService
  ) {}

  async createAdmin(admin: Admin): Promise<UserEntity> {
    return this.usersService.create({ ...admin, basePermissionLevel: 'ADMIN' }, this.adminAbility);
  }

  async dropDatabase(): Promise<void> {
    return this.connection.dropDatabase();
  }

  async getState(): Promise<SetupState> {
    return { isSetup: await this.isSetup() };
  }

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

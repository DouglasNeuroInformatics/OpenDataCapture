import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

import { createMongoAbility } from '@casl/ability';
import { AppAbility } from '@ddcp/types';
import mongoose from 'mongoose';

import { DemoService } from './demo.service.js';
import { CreateAdminDto, SetupDto } from './dto/setup.dto.js';

import { UsersService } from '@/users/users.service.js';

@Injectable()
export class SetupService {
  private readonly adminAbility = createMongoAbility<AppAbility>([{ action: 'manage', subject: 'all' }]);

  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly demoService: DemoService,
    private readonly usersService: UsersService
  ) {}

  async initApp({ admin, initDemo }: SetupDto) {
    if (await this.isInitialized()) {
      throw new ForbiddenException();
    }
    await this.dropDatabase();
    await this.createAdmin(admin);
    if (initDemo) {
      await this.demoService.init();
    }
  }

  async dropDatabase() {
    return this.connection.dropDatabase();
  }

  async createAdmin(admin: CreateAdminDto) {
    return this.usersService.create({ ...admin, basePermissionLevel: 'ADMIN' }, this.adminAbility);
  }

  private async isInitialized() {
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

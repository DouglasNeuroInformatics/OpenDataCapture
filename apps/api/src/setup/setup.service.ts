import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { CreateAdminData, SetupState } from '@open-data-capture/types';
import mongoose from 'mongoose';

import { UserEntity } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';

import { DemoService } from './demo.service';
import { SetupDto } from './dto/setup.dto';

@Injectable()
export class SetupService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly demoService: DemoService,
    private readonly usersService: UsersService
  ) {}

  async createAdmin(admin: CreateAdminData): Promise<UserEntity> {
    return this.usersService.create({ ...admin, basePermissionLevel: 'ADMIN' });
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

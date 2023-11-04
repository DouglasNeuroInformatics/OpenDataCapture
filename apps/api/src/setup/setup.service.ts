import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { CreateAdminData, SetupState } from '@open-data-capture/common/setup';
import mongoose from 'mongoose';

import { GroupsService } from '@/groups/groups.service';
import { UserEntity } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';

import { DemoService } from './demo.service';
import { SetupDto } from './dto/setup.dto';

@Injectable()
export class SetupService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly demoService: DemoService,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService
  ) {}

  async createAdmin(admin: CreateAdminData & { groupNames: string[] }): Promise<UserEntity> {
    return this.usersService.create({ ...admin, basePermissionLevel: 'ADMIN' });
  }

  async dropDatabase(): Promise<void> {
    return this.connection.dropDatabase();
  }

  async getState(): Promise<SetupState> {
    return { isSetup: await this.isSetup() };
  }

  async initApp({ admin, adminGroup, initDemo }: SetupDto): Promise<void> {
    if (await this.isSetup()) {
      throw new ForbiddenException();
    }
    await this.dropDatabase();
    await this.groupsService.create(adminGroup);
    await this.createAdmin({ ...admin, groupNames: [adminGroup.name] });
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

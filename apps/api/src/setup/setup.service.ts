import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CreateAdminData, SetupState } from '@open-data-capture/common/setup';
import { PrismaClient } from '@open-data-capture/database/core';

import { InjectPrismaClient } from '@/prisma/prisma.decorators';
import { UsersService } from '@/users/users.service';

import { DemoService } from './demo.service';
import { SetupDto } from './dto/setup.dto';

@Injectable()
export class SetupService {
  constructor(
    @InjectPrismaClient() private readonly prismaClient: PrismaClient,
    private readonly demoService: DemoService,
    private readonly usersService: UsersService
  ) {}

  async createAdmin(admin: CreateAdminData) {
    return this.usersService.create({ ...admin, basePermissionLevel: 'ADMIN' });
  }

  async dropDatabase() {
    return this.prismaClient.$runCommandRaw({
      dropDatabase: 1
    });
  }

  async getState() {
    return { isSetup: await this.isSetup() } satisfies SetupState;
  }

  async initApp({ admin, initDemo }: SetupDto) {
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
    const collections: { cursor?: { firstBatch?: unknown[] } } = await this.prismaClient.$runCommandRaw({
      listCollections: 1
    });
    return collections.cursor?.firstBatch?.length !== 0;
  }
}

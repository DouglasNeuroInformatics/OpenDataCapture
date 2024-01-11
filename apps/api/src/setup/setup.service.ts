import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CreateAdminData, SetupState } from '@open-data-capture/common/setup';

import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';

import { DemoService } from './demo.service';
import { SetupDto } from './dto/setup.dto';

@Injectable()
export class SetupService {
  constructor(
    private readonly demoService: DemoService,
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService
  ) {}

  async createAdmin(admin: CreateAdminData) {
    return this.usersService.create({ ...admin, basePermissionLevel: 'ADMIN', groupIds: [] });
  }

  async getState() {
    return { isSetup: await this.isSetup() } satisfies SetupState;
  }

  async initApp({ admin, initDemo }: SetupDto) {
    if (await this.isSetup()) {
      throw new ForbiddenException();
    }
    await this.prismaService.dropDatabase();
    await this.createAdmin(admin);
    if (initDemo) {
      await this.demoService.init();
    }
  }

  private async isSetup(): Promise<boolean> {
    const collections: { cursor?: { firstBatch?: unknown[] } } = await this.prismaService.listCollections();
    return collections.cursor?.firstBatch?.length !== 0;
  }
}

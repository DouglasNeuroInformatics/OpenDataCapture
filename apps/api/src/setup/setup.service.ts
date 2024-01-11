import { ForbiddenException, Injectable } from '@nestjs/common';
import { type CreateAdminData } from '@open-data-capture/common/setup';

import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';

import { DemoService } from './demo.service';
import { SetupDto } from './dto/setup.dto';
import { SetupOptions } from './setup.options';

@Injectable()
export class SetupService {
  constructor(
    private readonly demoService: DemoService,
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly setupOptions: SetupOptions
  ) {}

  async createAdmin(admin: CreateAdminData) {
    return this.usersService.create({ ...admin, basePermissionLevel: 'ADMIN', groupIds: [] });
  }

  async getSetupStatus() {
    return {
      isSetup: Boolean(await this.setupOptions.getOption('isSetup'))
    };
  }

  async initApp({ admin, enableGateway, initDemo }: SetupDto) {
    const isSetup = await this.setupOptions.getOption('isSetup');
    if (isSetup) {
      throw new ForbiddenException();
    }
    await this.prismaService.dropDatabase();
    await this.createAdmin(admin);
    if (initDemo) {
      await this.demoService.init();
    }
    await this.setupOptions.setOption('isGatewayEnabled', enableGateway);
    await this.setupOptions.setOption('isSetup', true);
  }
}

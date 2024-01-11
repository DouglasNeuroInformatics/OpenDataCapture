import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type CreateAdminData } from '@open-data-capture/common/setup';

import { DemoService } from '@/demo/demo.service';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';

import { SetupDto } from './dto/setup.dto';
import { SetupOptions } from './setup.options';

@Injectable()
export class SetupService {
  constructor(
    private readonly configService: ConfigService,
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
    const isDev = this.configService.getOrThrow<string>('NODE_ENV') === 'development';
    const isSetup = await this.setupOptions.getOption('isSetup');
    if (isSetup && !isDev) {
      throw new ForbiddenException();
    }
    await this.prismaService.dropDatabase();
    await this.createAdmin(admin);
    if (initDemo) {
      await this.demoService.init();
    }
    await this.setupOptions.setOption('isGatewayEnabled', enableGateway);
    await this.setupOptions.setOption('isSetup', true);
    return { success: true };
  }
}

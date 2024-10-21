import { ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { type CreateAdminData } from '@opendatacapture/schemas/setup';
import type { InitAppOptions, SetupState, UpdateSetupStateData } from '@opendatacapture/schemas/setup';

import { ConfigurationService } from '@/configuration/configuration.service';
import { DemoService } from '@/demo/demo.service';
import { InjectModel } from '@/prisma/prisma.decorators';
import { PrismaService } from '@/prisma/prisma.service';
import type { Model } from '@/prisma/prisma.types';
import { UsersService } from '@/users/users.service';

@Injectable()
export class SetupService {
  constructor(
    @InjectModel('SetupState') private readonly setupStateModel: Model<'SetupState'>,
    private readonly configurationService: ConfigurationService,
    private readonly demoService: DemoService,
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService
  ) {}

  async createAdmin(admin: CreateAdminData) {
    return this.usersService.create({ ...admin, basePermissionLevel: 'ADMIN', groupIds: [] });
  }

  async getState() {
    const savedOptions = await this.getSavedOptions();
    return {
      isDemo: Boolean(savedOptions?.isDemo),
      isExperimentalFeaturesEnabled: Boolean(savedOptions?.isExperimentalFeaturesEnabled),
      isGatewayEnabled: this.configurationService.get('GATEWAY_ENABLED'),
      isSetup: Boolean(savedOptions?.isSetup),
      release: __RELEASE__,
      uptime: Math.round(process.uptime())
    } satisfies SetupState;
  }

  async initApp({ admin, dummySubjectCount, enableExperimentalFeatures, initDemo, recordsPerSubject }: InitAppOptions) {
    const isDev = this.configurationService.get('NODE_ENV') === 'development';
    const savedOptions = await this.getSavedOptions();
    if (savedOptions?.isSetup && !isDev) {
      throw new ForbiddenException();
    }
    await this.prismaService.dropDatabase();
    await this.createAdmin(admin);
    if (initDemo) {
      await this.demoService.init({
        dummySubjectCount: dummySubjectCount ?? 0,
        recordsPerSubject: recordsPerSubject ?? 0
      });
    }
    await this.setupStateModel.create({
      data: { isDemo: initDemo, isExperimentalFeaturesEnabled: enableExperimentalFeatures, isSetup: true }
    });
    return { success: true };
  }

  async updateState(data: UpdateSetupStateData): Promise<Partial<SetupState>> {
    const setupState = await this.getSavedOptions();
    if (!setupState?.isSetup) {
      throw new ServiceUnavailableException('Cannot update state before setup');
    }
    return this.setupStateModel.update({
      data,
      where: {
        id: setupState.id
      }
    });
  }

  private async getSavedOptions() {
    return await this.setupStateModel.findFirst();
  }
}

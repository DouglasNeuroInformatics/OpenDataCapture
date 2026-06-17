import { isPlainObject } from '@douglasneuroinformatics/libjs';
import { ConfigService, InjectModel, InjectPrismaClient } from '@douglasneuroinformatics/libnest';
import type { Model } from '@douglasneuroinformatics/libnest';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException
} from '@nestjs/common';
import { $BrandingConfig } from '@opendatacapture/schemas/setup';
import type { CreateAdminData, InitAppOptions, SetupState, UpdateSetupStateData } from '@opendatacapture/schemas/setup';

import type { RuntimePrismaClient } from '@/core/prisma';
import { DemoService } from '@/demo/demo.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class SetupService {
  constructor(
    @InjectPrismaClient() private readonly prismaClient: RuntimePrismaClient,
    @InjectModel('SetupState') private readonly setupStateModel: Model<'SetupState'>,
    private readonly configService: ConfigService,
    private readonly demoService: DemoService,
    private readonly usersService: UsersService
  ) {}

  async createAdmin(admin: CreateAdminData) {
    return this.usersService.create({ ...admin, basePermissionLevel: 'ADMIN', groupIds: [] });
  }

  async delete(): Promise<void> {
    const isTest = this.configService.get('NODE_ENV') === 'test';
    if (!isTest) {
      throw new ForbiddenException('Cannot access outside of test');
    }
    await this.dropDatabase();
  }

  async getState() {
    const savedOptions = await this.getSavedOptions();
    // The stored value is validated against the schema so that scalar columns
    // (e.g. `loginTheme`) are narrowed to their expected literal union types.
    // Note: unknown keys are stripped here, so a stale dev server running an
    // older $BrandingConfig will silently drop newer branding fields on read.
    const branding = $BrandingConfig.nullable().safeParse(savedOptions?.branding ?? null);
    return {
      branding: branding.success ? branding.data : null,
      isDemo: Boolean(savedOptions?.isDemo),
      isExperimentalFeaturesEnabled: Boolean(savedOptions?.isExperimentalFeaturesEnabled),
      isGatewayEnabled: this.configService.get('GATEWAY_ENABLED'),
      isSetup: Boolean(savedOptions?.isSetup),
      release: __RELEASE__,
      uptime: Math.round(process.uptime())
    } satisfies SetupState;
  }

  async initApp({ admin, dummySubjectCount, enableExperimentalFeatures, initDemo, recordsPerSubject }: InitAppOptions) {
    const isDev = this.configService.get('NODE_ENV') === 'development';
    const savedOptions = await this.getSavedOptions();
    if (savedOptions?.isSetup && !isDev) {
      throw new ForbiddenException();
    }
    await this.dropDatabase();
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

  async updateState({ branding, ...rest }: UpdateSetupStateData): Promise<Partial<SetupState>> {
    const setupState = await this.getSavedOptions();
    if (!setupState?.isSetup) {
      throw new ServiceUnavailableException('Cannot update state before setup');
    }
    const normalizedBranding = branding ? { resourceLinks: [], sectionsOrder: [], ...branding } : branding;
    await this.setupStateModel.update({
      data: {
        ...rest,
        ...(branding !== undefined ? { branding: { set: normalizedBranding ?? null } } : {})
      },
      where: {
        id: setupState.id
      }
    });
    return this.getState();
  }

  private async dropDatabase(): Promise<void> {
    const result = await this.prismaClient.$runCommandRaw({ dropDatabase: 1 });
    if (!isPlainObject(result) || result.ok !== 1) {
      throw new InternalServerErrorException('Failed to drop database: raw mongodb command returned unexpected value', {
        cause: result
      });
    }
  }

  private async getSavedOptions() {
    return await this.setupStateModel.findFirst();
  }
}

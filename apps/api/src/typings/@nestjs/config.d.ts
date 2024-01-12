declare module '@nestjs/config' {
  import { ConfigService as BaseConfigService, ConditionalModule, ConfigModule } from '@nestjs/config/dist';

  import type { EnvironmentConfig } from '@/core/config/config.schema';

  declare class ConfigService extends BaseConfigService<EnvironmentConfig> {}

  export { ConditionalModule, ConfigModule, ConfigService };
}

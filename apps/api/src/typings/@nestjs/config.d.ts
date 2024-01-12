declare module '@nestjs/config' {
  import { ConditionalModule, ConfigModule } from '@nestjs/config/dist';

  import type { EnvironmentConfig } from '@/core/config/config.schema';

  declare class ConfigService {
    get<TKey extends Extract<keyof EnvironmentConfig, string>>(propertyPath: TKey): EnvironmentConfig[TKey];
  }

  export { ConditionalModule, ConfigModule, ConfigService };
}

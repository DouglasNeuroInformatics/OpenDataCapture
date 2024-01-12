import { type DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { $Configuration } from './configuration.schema';
import { ConfigurationService } from './configuration.service';

@Module({})
export class ConfigurationModule {
  static forRoot(): DynamicModule {
    return {
      exports: [ConfigurationService],
      global: true,
      imports: [
        ConfigModule.forRoot({
          validate: (config) => $Configuration.parse(config)
        })
      ],
      module: ConfigurationModule,
      providers: [ConfigurationService]
    };
  }
}

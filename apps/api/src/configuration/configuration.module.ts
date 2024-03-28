import { type DynamicModule, Module, type ModuleMetadata } from '@nestjs/common';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import type { ConditionalKeys } from 'type-fest';

import { $Configuration, type Configuration } from './configuration.schema';
import { ConfigurationService } from './configuration.service';

type ConditionalModuleOptions =
  | {
      condition: ConditionalKeys<Configuration, boolean>;
      module: Required<ModuleMetadata>['imports'][number];
      modules?: undefined;
    }
  | {
      condition: ConditionalKeys<Configuration, boolean>;
      module?: undefined;
      modules: Required<ModuleMetadata>['imports'][number][];
    };

type ConfigurationModuleOptions = {
  conditionalModules: ConditionalModuleOptions[];
};

@Module({})
export class ConfigurationModule {
  static forRoot(options: ConfigurationModuleOptions): DynamicModule {
    return {
      exports: [ConfigurationService],
      global: true,
      imports: [
        ...options.conditionalModules.flatMap(({ condition, module, modules }) =>
          module
            ? ConditionalModule.registerWhen(module, condition!)
            : modules.map((module) => ConditionalModule.registerWhen(module, condition!))
        ),
        ConfigModule.forRoot({
          validate: (config) => $Configuration.parse(config)
        })
      ],
      module: ConfigurationModule,
      providers: [ConfigurationService]
    };
  }
}

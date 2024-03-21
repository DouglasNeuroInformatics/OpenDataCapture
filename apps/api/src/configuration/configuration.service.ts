import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Configuration } from './configuration.schema';

@Injectable()
export class ConfigurationService {
  constructor(private readonly configService: ConfigService) {}

  get<TKey extends Extract<keyof Configuration, string>>(key: TKey) {
    return this.configService.get<Configuration[TKey]>(key)!;
  }
}

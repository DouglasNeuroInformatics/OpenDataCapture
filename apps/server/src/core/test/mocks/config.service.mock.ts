import { ConfigService } from '@nestjs/config';

import { createMock } from '@golevelup/ts-jest';

export const MockConfigService = createMock<ConfigService>({
  getOrThrow(property: string) {
    return property;
  }
});

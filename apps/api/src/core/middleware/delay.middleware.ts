import { Injectable, type NestMiddleware } from '@nestjs/common';

import { ConfigurationService } from '@/configuration/configuration.service';

@Injectable()
export class DelayMiddleware implements NestMiddleware {
  constructor(private readonly configurationService: ConfigurationService) {}

  use(_req: any, _res: any, next: (error?: any) => void) {
    const responseDelay = this.configurationService.get('API_RESPONSE_DELAY');
    if (!responseDelay) {
      return next();
    }
    setTimeout(() => {
      next();
    }, responseDelay);
  }
}

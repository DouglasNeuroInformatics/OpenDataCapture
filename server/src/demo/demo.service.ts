import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DemoService implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly configService: ConfigService) {}

  isDemo(): boolean {
    return this.configService.getOrThrow('NODE_ENV');
  }

  onApplicationBootstrap(): void {
    if (this.isDemo()) {
      console.log('Init Demo...');
    }
  }

  onApplicationShutdown(): void {
    if (this.isDemo()) {
      console.log('Shutdown demo...');
    }
  }
}

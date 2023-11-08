import { Injectable, InternalServerErrorException, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Assignment } from '@open-data-capture/common/assignment';

@Injectable()
export class GatewayService implements OnApplicationBootstrap {
  private readonly baseURL: string;
  private readonly logger = new Logger(GatewayService.name);

  constructor(readonly configService: ConfigService) {
    this.baseURL = configService.getOrThrow('GATEWAY_URL');
  }

  async add(assignments: Assignment[]) {
    const response = await fetch(this.baseURL, {
      body: JSON.stringify({ assignments }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });
    if (!response.ok) {
      throw new InternalServerErrorException(`Request to gateway failed with status code ${response.status}`, {
        cause: await response.json()
      });
    }
  }

  onApplicationBootstrap() {
    setTimeout(() => void this.refresh(), 5000);
  }

  async refresh() {
    const assignments = await this.get();
    console.log(assignments);
  }

  private async get() {
    const response = await fetch(this.baseURL, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET'
    });
    if (!response.ok) {
      this.logger.warn(`REQUEST TO GATEWAY FAILED: ${response.status}`);
    }
    return response.json() as Promise<{ assignments: Assignment[] }>;
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AssignmentBundle } from '@open-data-capture/common/assignment';

@Injectable()
export class GatewayService {
  private readonly baseURL: string;

  constructor(readonly configService: ConfigService) {
    this.baseURL = configService.getOrThrow('GATEWAY_URL');
  }

  async create(bundle: AssignmentBundle) {
    try {
      const response = await fetch(this.baseURL, {
        body: JSON.stringify(bundle),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      });
      if (!response.ok) {
        throw response;
      }
      return response.json();
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Request to gateway failed', {
        cause: err
      });
    }
  }

  // onApplicationBootstrap() {
  //   setTimeout(() => void this.refresh(), 5000);
  // }

  // async refresh() {
  //   const assignments = await this.get();
  //   console.log(assignments);
  // }

  // private async get() {
  //   const response = await fetch(this.baseURL, {
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     method: 'GET'
  //   });
  //   if (!response.ok) {
  //     this.logger.warn(`REQUEST TO GATEWAY FAILED: ${response.status}`);
  //   }
  //   return response.json() as Promise<{ assignments: Assignment[] }>;
  // }
}

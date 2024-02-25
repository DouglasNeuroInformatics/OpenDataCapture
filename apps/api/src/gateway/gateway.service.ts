import type { PublicEncryptionKey } from '@douglasneuroinformatics/crypto';
import { HttpService } from '@nestjs/axios';
import { BadGatewayException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { $MutateAssignmentResponseBody, $RemoteAssignment } from '@open-data-capture/common/assignment';
import type {
  Assignment,
  CreateRemoteAssignmentInputData,
  MutateAssignmentResponseBody,
  RemoteAssignment
} from '@open-data-capture/common/assignment';

import { ConfigurationService } from '@/configuration/configuration.service';
import { InstrumentsService } from '@/instruments/instruments.service';

@Injectable()
export class GatewayService {
  private readonly gatewayBaseUrl: string;
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    configurationService: ConfigurationService,
    private readonly httpService: HttpService,
    private readonly instrumentsService: InstrumentsService
  ) {
    if (configurationService.get('NODE_ENV') === 'production') {
      const internalNetworkUrl = configurationService.get('GATEWAY_INTERNAL_NETWORK_URL');
      const siteAddress = configurationService.get('GATEWAY_SITE_ADDRESS')!;
      if (siteAddress.hostname === 'localhost' && internalNetworkUrl) {
        this.gatewayBaseUrl = internalNetworkUrl.href;
      } else {
        this.gatewayBaseUrl = siteAddress.href;
      }
    } else {
      const gatewayPort = configurationService.get('GATEWAY_DEV_SERVER_PORT')!;
      this.gatewayBaseUrl = `http://localhost:${gatewayPort}`;
    }
  }

  async createRemoteAssignment(
    assignment: Assignment,
    publicKey: PublicEncryptionKey
  ): Promise<MutateAssignmentResponseBody> {
    const instrument = await this.instrumentsService.findById(assignment.instrumentId);
    const response = await this.httpService.axiosRef.post(`${this.gatewayBaseUrl}/api/assignments`, {
      ...assignment,
      instrumentBundle: instrument.bundle,
      publicKey: await publicKey.toJSON()
    } satisfies CreateRemoteAssignmentInputData);
    if (response.status !== HttpStatus.CREATED) {
      throw new BadGatewayException(`Unexpected Status Code From Gateway: ${response.status}`, {
        cause: response.statusText
      });
    }
    return $MutateAssignmentResponseBody.parseAsync(response.data);
  }

  async deleteRemoteAssignment(id: string): Promise<MutateAssignmentResponseBody> {
    const response = await this.httpService.axiosRef.delete(`${this.gatewayBaseUrl}/api/assignments/${id}`);
    if (response.status !== HttpStatus.OK) {
      throw new BadGatewayException(`Unexpected Status Code From Gateway: ${response.status}`, {
        cause: response.statusText
      });
    }
    return $MutateAssignmentResponseBody.parseAsync(response.data);
  }

  async fetchRemoteAssignments({ subjectId }: { subjectId?: string } = {}): Promise<RemoteAssignment[]> {
    const response = await this.httpService.axiosRef.get(`${this.gatewayBaseUrl}/api/assignments`, {
      params: {
        subjectId
      }
    });
    if (response.status !== HttpStatus.OK) {
      throw new BadGatewayException(`Unexpected Status Code From Gateway: ${response.status}`, {
        cause: response.statusText
      });
    }
    const result = await $RemoteAssignment.array().safeParseAsync(response.data);
    if (!result.success) {
      this.logger.error({
        data: response.data,
        error: result.error.format(),
        message: 'ERROR: Remote assignments received from gateway do not match expected structure'
      });
      return [];
    }
    return result.data;
  }
}

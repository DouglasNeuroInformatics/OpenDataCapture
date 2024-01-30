import type { PublicEncryptionKey } from '@douglasneuroinformatics/crypto';
import { HttpService } from '@nestjs/axios';
import { BadGatewayException, HttpStatus, Injectable } from '@nestjs/common';
import { $MutateAssignmentResponseBody, $RemoteAssignment } from '@open-data-capture/common/assignment';
import type {
  Assignment,
  CreateRemoteAssignmentData,
  MutateAssignmentResponseBody,
  RemoteAssignment
} from '@open-data-capture/common/assignment';

import { ConfigurationService } from '@/configuration/configuration.service';
import { InstrumentsService } from '@/instruments/instruments.service';

@Injectable()
export class GatewayService {
  private readonly gatewayBaseUrl: string;

  constructor(
    configurationService: ConfigurationService,
    private readonly httpService: HttpService,
    private readonly instrumentsService: InstrumentsService
  ) {
    this.gatewayBaseUrl = configurationService.get('GATEWAY_BASE_URL');
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
    } satisfies CreateRemoteAssignmentData);
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
    return $RemoteAssignment.array().parseAsync(response.data);
  }
}

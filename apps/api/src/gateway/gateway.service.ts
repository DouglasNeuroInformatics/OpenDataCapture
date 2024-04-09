import { HttpService } from '@nestjs/axios';
import { BadGatewayException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import type { PublicEncryptionKey } from '@opendatacapture/crypto';
import { $MutateAssignmentResponseBody, $RemoteAssignment } from '@opendatacapture/schemas/assignment';
import type {
  Assignment,
  CreateRemoteAssignmentInputData,
  MutateAssignmentResponseBody,
  RemoteAssignment
} from '@opendatacapture/schemas/assignment';

import { InstrumentsService } from '@/instruments/instruments.service';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly instrumentsService: InstrumentsService
  ) {}

  async createRemoteAssignment(
    assignment: Assignment,
    publicKey: PublicEncryptionKey
  ): Promise<MutateAssignmentResponseBody> {
    const instrument = await this.instrumentsService.findById(assignment.instrumentId);
    const response = await this.httpService.axiosRef.post(`/api/assignments`, {
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
    const response = await this.httpService.axiosRef.delete(`/api/assignments/${id}`);
    if (response.status !== HttpStatus.OK) {
      throw new BadGatewayException(`Unexpected Status Code From Gateway: ${response.status}`, {
        cause: response.statusText
      });
    }
    return $MutateAssignmentResponseBody.parseAsync(response.data);
  }

  async fetchRemoteAssignments({ subjectId }: { subjectId?: string } = {}): Promise<RemoteAssignment[]> {
    const response = await this.httpService.axiosRef.get(`/api/assignments`, {
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
        data: response.data as unknown,
        error: result.error.format(),
        message: 'ERROR: Remote assignments received from gateway do not match expected structure'
      });
      return [];
    }
    return result.data;
  }
}

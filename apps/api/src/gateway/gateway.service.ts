import type { webcrypto } from 'node:crypto';

import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import { LoggingService } from '@douglasneuroinformatics/libnest';
import { HttpService } from '@nestjs/axios';
import { BadGatewayException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { $MutateAssignmentResponseBody, $RemoteAssignment } from '@opendatacapture/schemas/assignment';
import type {
  Assignment,
  CreateRemoteAssignmentInputData,
  MutateAssignmentResponseBody,
  RemoteAssignment
} from '@opendatacapture/schemas/assignment';
import { $GatewayHealthcheckSuccessResult } from '@opendatacapture/schemas/gateway';
import type { GatewayHealthcheckFailureResult, GatewayHealthcheckResult } from '@opendatacapture/schemas/gateway';
import type { AxiosResponse } from 'axios';

import { InstrumentsService } from '@/instruments/instruments.service';
import { SetupService } from '@/setup/setup.service';

@Injectable()
export class GatewayService {
  constructor(
    private readonly httpService: HttpService,
    private readonly instrumentsService: InstrumentsService,
    private readonly loggingService: LoggingService,
    private readonly setupService: SetupService
  ) {}

  async createRemoteAssignment(
    assignment: Assignment,
    publicKey: webcrypto.CryptoKey
  ): Promise<MutateAssignmentResponseBody> {
    const instrument = await this.instrumentsService.findBundleById(assignment.instrumentId);
    // The gateway cannot read this instance's setup state, so the languages it may offer this
    // patient are sent with the assignment.
    const { activeLanguages } = await this.setupService.getState();
    const serializedPublicKey = Array.from(await HybridCrypto.serializePublicKey(publicKey));
    const response = await this.request(HttpStatus.CREATED, 'create remote assignment', () =>
      this.httpService.axiosRef.post(`/api/assignments`, {
        ...assignment,
        activeLanguages,
        instrumentContainer: instrument,
        publicKey: serializedPublicKey
      } satisfies CreateRemoteAssignmentInputData)
    );
    return $MutateAssignmentResponseBody.parseAsync(response.data);
  }

  async deleteRemoteAssignment(id: string): Promise<MutateAssignmentResponseBody> {
    const response = await this.request(HttpStatus.OK, `delete remote assignment '${id}'`, () =>
      this.httpService.axiosRef.delete(`/api/assignments/${id}`)
    );
    return $MutateAssignmentResponseBody.parseAsync(response.data);
  }

  async fetchRemoteAssignments({ subjectId }: { subjectId?: string } = {}): Promise<RemoteAssignment[]> {
    const response = await this.request(HttpStatus.OK, 'fetch remote assignments', () =>
      this.httpService.axiosRef.get(`/api/assignments`, {
        params: {
          subjectId
        }
      })
    );
    const result = await $RemoteAssignment.array().safeParseAsync(response.data);
    if (!result.success) {
      this.loggingService.error({
        data: response.data as unknown,
        error: result.error.format(),
        message: 'ERROR: Remote assignments received from gateway do not match expected structure'
      });
      return [];
    }
    return result.data;
  }

  async healthcheck(): Promise<GatewayHealthcheckResult> {
    // This route exists to report an unhealthy gateway, so an unreachable one is an answer rather
    // than an error: throwing here would leave the caller unable to distinguish "down" from "broken".
    let response: AxiosResponse;
    try {
      response = await this.httpService.axiosRef.get('/api/healthcheck');
    } catch (err) {
      this.loggingService.error({ error: err, message: 'ERROR: Failed to reach gateway for healthcheck' });
      return {
        ok: false,
        status: HttpStatus.SERVICE_UNAVAILABLE,
        statusText: 'Failed to reach gateway'
      };
    }
    if (response.status !== HttpStatus.OK) {
      return {
        ok: false,
        status: response.status,
        statusText: response.statusText
      } satisfies GatewayHealthcheckFailureResult;
    }
    const result = await $GatewayHealthcheckSuccessResult.safeParseAsync(response.data);
    if (!result.success) {
      const statusText = 'Healthcheck data received from gateway do not match expected structure';
      this.loggingService.error({
        data: response.data as unknown,
        error: result.error.format(),
        message: `ERROR: ${statusText}`
      });
      return {
        ok: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        statusText
      };
    }
    return result.data;
  }

  /**
   * Perform a gateway request, distinguishing the two ways it can fail. A rejection means the gateway
   * was never reached; any other status than the expected one means it answered and refused. Both
   * carry what the gateway said into the thrown exception, so the cause is named rather than
   * collapsing into an anonymous 500.
   */
  private async request(
    expectedStatus: HttpStatus,
    operation: string,
    send: () => Promise<AxiosResponse>
  ): Promise<AxiosResponse> {
    let response: AxiosResponse;
    try {
      response = await send();
    } catch (err) {
      this.loggingService.error({ error: err, message: `ERROR: Failed to reach gateway to ${operation}` });
      throw new ServiceUnavailableException(`Failed to reach gateway to ${operation}`, { cause: err });
    }
    if (response.status !== expectedStatus) {
      this.loggingService.error({
        data: response.data as unknown,
        message: `ERROR: Gateway refused to ${operation}: ${response.status} ${response.statusText}`
      });
      throw new BadGatewayException(
        `Gateway refused to ${operation}: responded ${response.status} ${response.statusText}, expected ${expectedStatus}`,
        { cause: response.data }
      );
    }
    return response;
  }
}

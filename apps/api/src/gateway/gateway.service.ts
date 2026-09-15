import type { webcrypto } from 'node:crypto';

import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import { LoggingService } from '@douglasneuroinformatics/libnest';
import { HttpService } from '@nestjs/axios';
import { BadGatewayException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { $MutateAssignmentResponseBody, $RemoteAssignment } from '@opendatacapture/schemas/assignment';
import type {
  Assignment,
  CreateRemoteAssignmentInputData,
  CreateRemoteAssignmentsInputData,
  MutateAssignmentResponseBody,
  RemoteAssignment
} from '@opendatacapture/schemas/assignment';
import { $GatewayHealthcheckSuccessResult } from '@opendatacapture/schemas/gateway';
import type {
  GatewayHealthcheckFailureResult,
  GatewayHealthcheckResult,
  RemoteSetupState
} from '@opendatacapture/schemas/gateway';

import { InstrumentsService } from '@/instruments/instruments.service';

@Injectable()
export class GatewayService {
  constructor(
    private readonly httpService: HttpService,
    private readonly instrumentsService: InstrumentsService,
    private readonly loggingService: LoggingService
  ) {}

  async createRemoteAssignment(
    assignment: Assignment,
    publicKey: webcrypto.CryptoKey
  ): Promise<MutateAssignmentResponseBody> {
    const instrument = await this.instrumentsService.findBundleById(assignment.instrumentId);
    const response = await this.httpService.axiosRef.post(`/api/assignments`, {
      ...assignment,
      instrumentContainer: instrument,
      publicKey: Array.from(await HybridCrypto.serializePublicKey(publicKey))
    } satisfies CreateRemoteAssignmentInputData);
    if (response.status !== HttpStatus.CREATED) {
      throw new BadGatewayException(`Unexpected Status Code From Gateway: ${response.status}`, {
        cause: response.statusText
      });
    }
    return $MutateAssignmentResponseBody.parseAsync(response.data);
  }

  /**
   * Send a whole batch to the gateway in one request.
   *
   * Each distinct instrument's bundle is fetched once and sent once, no matter how many assignments
   * reference it — a batch is a handful of instruments across hundreds of subjects, so fetching per
   * assignment would re-read and re-transmit the same compiled bundle hundreds of times.
   *
   * The gateway writes the batch in a transaction, so this either persists in full or not at all.
   */
  async createRemoteAssignments(
    entries: { assignment: Assignment; publicKey: webcrypto.CryptoKey }[]
  ): Promise<MutateAssignmentResponseBody> {
    const instrumentIds = [...new Set(entries.map(({ assignment }) => assignment.instrumentId))];
    const instruments = await Promise.all(
      instrumentIds.map(async (instrumentId) => ({
        instrumentContainer: await this.instrumentsService.findBundleById(instrumentId),
        instrumentId
      }))
    );
    const assignments = await Promise.all(
      entries.map(async ({ assignment, publicKey }) => ({
        ...assignment,
        publicKey: Array.from(await HybridCrypto.serializePublicKey(publicKey))
      }))
    );
    const response = await this.httpService.axiosRef.post(`/api/assignments/bulk`, {
      assignments,
      instruments
    } satisfies CreateRemoteAssignmentsInputData);
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
    const response = await this.httpService.axiosRef.get('/api/healthcheck');
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
   * Replace the setup state held by the gateway. The gateway cannot reach this instance, so it
   * learns of a change only by being told; it is told on every synchronization pass rather than
   * only when the state changes, which is what lets a gateway that missed the change — restarting,
   * unreachable, redeployed with an empty in-memory copy — catch up on its own.
   */
  async updateRemoteSetupState(setupState: RemoteSetupState): Promise<void> {
    const response = await this.httpService.axiosRef.put(`/api/setup-state`, setupState);
    if (response.status !== HttpStatus.NO_CONTENT) {
      throw new InternalServerErrorException(`Unexpected Status Code From Gateway: ${response.status}`, {
        cause: response.statusText
      });
    }
  }
}

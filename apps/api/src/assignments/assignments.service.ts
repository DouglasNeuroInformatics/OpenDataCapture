import crypto from 'node:crypto';
import type { webcrypto } from 'node:crypto';

import { HybridCrypto } from '@douglasneuroinformatics/libcrypto';
import { ConfigService, InjectModel, LoggingService } from '@douglasneuroinformatics/libnest';
import type { Model, RequestUser } from '@douglasneuroinformatics/libnest';
import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type {
  Assignment,
  BulkAssignmentFailure,
  BulkAssignmentIssue,
  BulkAssignmentPreflightData,
  BulkAssignmentPreflightResult,
  CreateBulkAssignmentsData,
  UpdateAssignmentData
} from '@opendatacapture/schemas/assignment';

import { AuditLogger } from '@/audit/audit.logger';
import { accessibleQuery, forcedAppSubject } from '@/auth/ability.utils';
import type { EntityOperationOptions } from '@/core/types';
import { GatewayService } from '@/gateway/gateway.service';

import { CreateAssignmentDto } from './dto/create-assignment.dto';

/**
 * How many assignments a batch prepares at once. Key generation is CPU-bound, so an unbounded
 * `Promise.all` over 500 subjects would hold the event loop for the whole batch and stall every
 * other request the process is serving.
 */
const BULK_KEYPAIR_CONCURRENCY = 16;

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) {
    chunks.push(values.slice(i, i + size));
  }
  return chunks;
}

@Injectable()
export class AssignmentsService {
  private readonly assignmentBaseUrl: string;

  constructor(
    @InjectModel('Assignment') private readonly assignmentModel: Model<'Assignment'>,
    @InjectModel('Group') private readonly groupModel: Model<'Group'>,
    @InjectModel('Subject') private readonly subjectModel: Model<'Subject'>,
    configService: ConfigService,
    private readonly auditLogger: AuditLogger,
    private readonly gatewayService: GatewayService,
    private readonly loggingService: LoggingService
  ) {
    if (configService.get('NODE_ENV') === 'production') {
      const siteAddress = configService.getOrThrow('GATEWAY_SITE_ADDRESS');
      this.assignmentBaseUrl = siteAddress.origin;
    } else {
      const gatewayPort = configService.get('GATEWAY_DEV_SERVER_PORT');
      this.assignmentBaseUrl = `http://localhost:${gatewayPort}`;
    }
  }

  /**
   * Validate a whole batch without writing anything, so the client can show the user exactly what
   * is wrong before they commit. Returns the shape of the operation when it is clear, and throws
   * with every issue attached when it is not — a bulk operation is all-or-nothing, so there is no
   * such thing as a partially acceptable request.
   */
  async bulkPreflight(data: BulkAssignmentPreflightData, currentUser: RequestUser) {
    const { subjectIds, timepoints } = await this.resolveBulkRequest(data, currentUser);
    return {
      assignmentCount: subjectIds.length * timepoints.length,
      subjectCount: subjectIds.length,
      timepointCount: timepoints.length
    } satisfies BulkAssignmentPreflightResult;
  }

  async create(
    { expiresAt, groupId, instrumentId, subjectId }: CreateAssignmentDto,
    currentUser: RequestUser
  ): Promise<Assignment> {
    const { privateKey, publicKey } = await HybridCrypto.generateKeyPair();
    const id = crypto.randomUUID();
    const assignment = await this.assignmentModel.create({
      data: {
        encryptionKeyPair: {
          privateKey: Buffer.from(await HybridCrypto.serializePrivateKey(privateKey)),
          publicKey: Buffer.from(await HybridCrypto.serializePublicKey(publicKey))
        },
        expiresAt,
        group: groupId
          ? {
              connect: {
                id: groupId
              }
            }
          : undefined,
        id,
        instrument: {
          connect: {
            id: instrumentId
          }
        },
        status: 'OUTSTANDING',
        subject: {
          connect: {
            id: subjectId
          }
        },
        url: `${this.assignmentBaseUrl}/assignments/${id}`
      }
    });
    try {
      await this.gatewayService.createRemoteAssignment(assignment, publicKey);
    } catch (err) {
      await this.assignmentModel.delete({ where: { id } });
      throw err;
    }
    await this.auditLogger.log('CREATE', 'ASSIGNMENT', { groupId: groupId ?? null, userId: currentUser.id });
    return assignment;
  }

  /**
   * Create one assignment per subject per timepoint, or none at all.
   *
   * The checks preflight ran are repeated here rather than trusted: preflight is advisory and a
   * conflicting assignment can appear between the user reviewing the batch and submitting it. If
   * anything fails — validation, staging, or the gateway — every row staged by this call is deleted
   * and the caller is told what was wrong, leaving the instance exactly as it was.
   */
  async createBulk(data: CreateBulkAssignmentsData, currentUser: RequestUser): Promise<Assignment[]> {
    const { groupId, subjectIds, timepoints } = await this.resolveBulkRequest(data, currentUser);

    const staged: { assignment: Assignment; publicKey: webcrypto.CryptoKey }[] = [];
    try {
      // Bounded concurrency: key generation is CPU-bound, and a 500-subject batch spawning every
      // keypair at once would starve the event loop for the rest of the process.
      for (const batch of chunk(
        timepoints.flatMap(({ expiresAt, instrumentId }) =>
          subjectIds.map((subjectId) => ({ expiresAt, instrumentId, subjectId }))
        ),
        BULK_KEYPAIR_CONCURRENCY
      )) {
        staged.push(...(await Promise.all(batch.map((row) => this.stageAssignment({ ...row, groupId })))));
      }
      await this.gatewayService.createRemoteAssignments(staged);
    } catch (err) {
      await this.discardStagedAssignments(staged);
      throw err;
    }

    await this.auditLogger.log('CREATE', 'ASSIGNMENT', {
      groupId,
      metadata: {
        createdCount: String(staged.length),
        mode: 'BULK',
        requestedCount: String(subjectIds.length * timepoints.length)
      },
      userId: currentUser.id
    });
    return staged.map(({ assignment }) => assignment);
  }

  async find(
    { subjectId }: { subjectId?: string } = {},
    { ability }: EntityOperationOptions = {}
  ): Promise<Assignment[]> {
    return this.assignmentModel.findMany({
      where: {
        AND: [accessibleQuery(ability, 'read', 'Assignment'), { subjectId }]
      }
    });
  }

  async findById(id: string, { ability }: EntityOperationOptions = {}) {
    const assignment = await this.assignmentModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Assignment')], id }
    });
    if (!assignment) {
      throw new NotFoundException(`Failed to find assignment with ID: ${id}`);
    }
    return assignment;
  }

  async updateById(id: string, data: UpdateAssignmentData, currentUser: RequestUser) {
    if (data.status === 'CANCELED') {
      await this.gatewayService.deleteRemoteAssignment(id);
    }
    const assignment = await this.assignmentModel.update({
      data,
      where: { AND: [accessibleQuery(currentUser.ability, 'update', 'Assignment')], id }
    });
    await this.auditLogger.log('UPDATE', 'ASSIGNMENT', { groupId: assignment.groupId, userId: currentUser.id });
    return assignment;
  }

  /** used by the gateway internal system */
  async updateStatusById(id: string, status: UpdateAssignmentData['status']) {
    return this.assignmentModel.update({
      data: {
        status
      },
      where: {
        id
      }
    });
  }

  /** Remove rows staged by a failed batch. Best effort — a cleanup failure must not mask the cause. */
  private async discardStagedAssignments(staged: { assignment: Assignment }[]): Promise<void> {
    if (staged.length === 0) {
      return;
    }
    try {
      await this.assignmentModel.deleteMany({
        where: { id: { in: staged.map(({ assignment }) => assignment.id) } }
      });
    } catch (err) {
      this.loggingService.error({
        error: err,
        message: 'ERROR: Failed to roll back staged bulk assignments'
      });
    }
  }

  /**
   * Every authorization and validity check a bulk operation depends on, in one place so preflight
   * and create cannot drift apart. Throws with all issues attached; returns the resolved request
   * when there are none.
   */
  private async resolveBulkRequest(
    { allowDuplicates, groupId, subjectIds, timepoints }: BulkAssignmentPreflightData,
    { ability, id: userId }: RequestUser
  ) {
    // A group the caller cannot read is indistinguishable from one that does not exist.
    const group = await this.groupModel.findFirst({
      where: { AND: [accessibleQuery(ability, 'read', 'Group')], id: groupId }
    });
    if (!group) {
      throw new NotFoundException(`Failed to find group with ID: ${groupId}`);
    }
    if (!ability.can('create', forcedAppSubject('Assignment', { groupId }))) {
      throw new ForbiddenException('Insufficient permissions to create assignments for this group');
    }

    const issues: BulkAssignmentIssue[] = [];

    // The group's own opt-in list is the authority: an instrument existing is not permission to
    // assign it here.
    const accessibleInstrumentIds = new Set(group.accessibleInstrumentIds);
    const instrumentIds = timepoints.map(({ instrumentId }) => instrumentId);
    const unavailableInstrumentIds = instrumentIds.filter((id) => !accessibleInstrumentIds.has(id));
    if (unavailableInstrumentIds.length > 0) {
      issues.push({ instrumentIds: unavailableInstrumentIds, kind: 'INSTRUMENT_UNAVAILABLE' });
    }

    const availableSubjects = await this.subjectModel.findMany({
      select: { id: true },
      where: {
        AND: [accessibleQuery(ability, 'read', 'Subject')],
        groupIds: { has: groupId },
        id: { in: subjectIds }
      }
    });
    const availableSubjectIds = new Set(availableSubjects.map(({ id }) => id));
    const unavailableSubjectIds = subjectIds.filter((id) => !availableSubjectIds.has(id));
    if (unavailableSubjectIds.length > 0) {
      issues.push({ kind: 'SUBJECT_UNAVAILABLE', subjectIds: unavailableSubjectIds });
    }

    // A conflict is an assignment this group already has outstanding and unexpired for the same
    // subject and instrument — reassigning would give the participant two live links to the same
    // instrument. The caller may accept that, but only by saying so explicitly.
    if (!allowDuplicates && unavailableInstrumentIds.length === 0 && unavailableSubjectIds.length === 0) {
      const existing = await this.assignmentModel.findMany({
        select: { instrumentId: true, subjectId: true },
        where: {
          expiresAt: { gt: new Date() },
          groupId,
          instrumentId: { in: instrumentIds },
          status: 'OUTSTANDING',
          subjectId: { in: subjectIds }
        }
      });
      if (existing.length > 0) {
        issues.push({
          conflicts: existing.map(({ instrumentId, subjectId }) => ({ instrumentId, subjectId })),
          kind: 'CONFLICT'
        });
      }
    }

    if (issues.length > 0) {
      throw new UnprocessableEntityException({
        code: 'BULK_ASSIGNMENT_REFUSED',
        issues
      } satisfies BulkAssignmentFailure);
    }
    return { groupId, subjectIds, timepoints, userId };
  }

  /** Create the Mongo row and keypair for a single assignment within a batch. */
  private async stageAssignment({
    expiresAt,
    groupId,
    instrumentId,
    subjectId
  }: {
    expiresAt: Date;
    groupId: string;
    instrumentId: string;
    subjectId: string;
  }): Promise<{ assignment: Assignment; publicKey: webcrypto.CryptoKey }> {
    const { privateKey, publicKey } = await HybridCrypto.generateKeyPair();
    const id = crypto.randomUUID();
    const assignment = await this.assignmentModel.create({
      data: {
        encryptionKeyPair: {
          privateKey: Buffer.from(await HybridCrypto.serializePrivateKey(privateKey)),
          publicKey: Buffer.from(await HybridCrypto.serializePublicKey(publicKey))
        },
        expiresAt,
        group: { connect: { id: groupId } },
        id,
        instrument: { connect: { id: instrumentId } },
        status: 'OUTSTANDING',
        subject: { connect: { id: subjectId } },
        url: `${this.assignmentBaseUrl}/assignments/${id}`
      }
    });
    return { assignment, publicKey };
  }
}

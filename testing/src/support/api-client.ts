import type { $CreateAssignmentData, Assignment } from '@opendatacapture/schemas/assignment';
import { AUDIT_LOGS_MAX_PAGE_SIZE } from '@opendatacapture/schemas/audit';
import type { $AuditLog, $AuditLogAction, $AuditLogsPage } from '@opendatacapture/schemas/audit';
import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import type { Permissions } from '@opendatacapture/schemas/core';
import type { $CreateGroupData, Group } from '@opendatacapture/schemas/group';
import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';
import { MAIL_CLIENT_TIMEOUT } from '@opendatacapture/schemas/mail';
import type { $SendAssignmentEmailData, EmailDeliveryResult } from '@opendatacapture/schemas/mail';
import type { $CreateSessionData, Session } from '@opendatacapture/schemas/session';
import type { $CreateSubjectData } from '@opendatacapture/schemas/subject';
import type { $CreateUserData, $UpdateUserData, User } from '@opendatacapture/schemas/user';
import type { APIRequestContext } from '@playwright/test';

import { E2E_MAIL_CONFIG, SEEDED_USER_PASSWORD } from './constants';
import { randomId } from './unique';

const API = '/api/v1';

type UploadRecord = UploadInstrumentRecordsData['records'][number];

/** Typed helper for seeding preconditions (groups, users) and authenticating over the API. */
export class ApiClient {
  private readonly request: APIRequestContext;
  private readonly token: string;

  constructor(request: APIRequestContext, token: string) {
    this.request = request;
    this.token = token;
  }

  static async login(request: APIRequestContext, credentials: $LoginCredentials): Promise<string> {
    const response = await request.post(`${API}/auth/login`, { data: credentials });
    if (!response.ok()) {
      throw new Error(`Login failed for '${credentials.username}' (${response.status()}): ${await response.text()}`);
    }
    const { accessToken } = (await response.json()) as { accessToken: string };
    return accessToken;
  }

  private get authHeaders() {
    return { Authorization: `Bearer ${this.token}` };
  }

  async archiveUser(id: string): Promise<void> {
    await this.expectOk(
      this.request.patch(`${API}/users/${id}/archive`, { headers: this.authHeaders }),
      `archive user '${id}'`
    );
  }

  /** Creates a remote assignment through the single-assignment route the web app uses. */
  async createAssignment(data: $CreateAssignmentData): Promise<Assignment> {
    return this.expectJson<Assignment>(
      this.request.post(`${API}/assignments`, { data, headers: this.authHeaders }),
      201,
      'create assignment'
    );
  }

  /** Creates a group and grants it access to every available instrument, so seeded users can use them. */
  async createGroup(overrides: Partial<$CreateGroupData> = {}): Promise<Group> {
    const data: $CreateGroupData = { name: `Group ${randomId()}`, type: 'CLINICAL', ...overrides };
    const group = await this.expectJson<Group>(
      this.request.post(`${API}/groups`, { data, headers: this.authHeaders }),
      201,
      'create group'
    );
    const accessibleInstrumentIds = await this.getAccessibleInstrumentIds();
    await this.expectOk(
      this.request.patch(`${API}/groups/${group.id}`, { data: { accessibleInstrumentIds }, headers: this.authHeaders }),
      'grant instrument access'
    );
    return group;
  }

  /** Assembles a series owned by the group out of the first two forms available, returning its id. */
  async createSeries(groupId: string, title: string): Promise<string> {
    const items = (await this.getInstrumentInfo())
      .flatMap((info) => (info.kind === 'FORM' ? [{ edition: info.internal.edition, name: info.internal.name }] : []))
      .slice(0, 2);
    const result = await this.expectJson<{ instrumentId: string; outcome: 'created' }>(
      this.request.post(`${API}/instruments/series`, {
        data: { confirmDuplicate: true, details: { title }, groupId, items, language: 'en' },
        headers: this.authHeaders
      }),
      201,
      'create series'
    );
    return result.instrumentId;
  }

  /**
   * Creates a session, and with it the subject it names. A subject seeded this way holds no
   * instrument records, which is what distinguishes it under the "with records only" filter.
   */
  async createSession(groupId: null | string, subjectData: $CreateSubjectData): Promise<Session> {
    const data: $CreateSessionData = { date: new Date(), groupId, subjectData, type: 'IN_PERSON' };
    return this.expectJson<Session>(
      this.request.post(`${API}/sessions`, { data, headers: this.authHeaders }),
      201,
      'create session'
    );
  }

  /** Enrols a new subject in a group the way the app does, by starting a session for it. */
  async createSubject(groupId: string): Promise<string> {
    const session = await this.createSession(groupId, { id: `subject_${randomId()}` });
    return session.subjectId;
  }

  /** Creates a user (GROUP_MANAGER by default) and returns the login credentials for it. */
  async createUser(overrides: Partial<$CreateUserData> = {}): Promise<{ credentials: $LoginCredentials; user: User }> {
    const username = overrides.username ?? `user_${randomId()}`;
    const password = overrides.password ?? SEEDED_USER_PASSWORD;
    const data: $CreateUserData = {
      basePermissionLevel: 'GROUP_MANAGER',
      firstName: 'Test',
      groupIds: [],
      lastName: 'User',
      ...overrides,
      password,
      username
    };
    const user = await this.expectJson<User>(
      this.request.post(`${API}/users`, { data, headers: this.authHeaders }),
      201,
      'create user'
    );
    return { credentials: { password, username }, user };
  }

  /** Reads a subject's assignments back as admin, to check whether a write by another role took effect. */
  async findAssignments(subjectId: string): Promise<Assignment[]> {
    return this.expectJson<Assignment[]>(
      this.request.get(`${API}/assignments`, { headers: this.authHeaders, params: { subjectId } }),
      200,
      `find the assignments of subject '${subjectId}'`
    );
  }

  /** The newest audit entries for one action, as the audit log page and its JSON download read them. */
  async findAuditLogs(action: $AuditLogAction): Promise<$AuditLog[]> {
    const { data } = await this.expectJson<$AuditLogsPage>(
      this.request.get(`${API}/audit/logs`, {
        headers: this.authHeaders,
        params: { action, limit: AUDIT_LOGS_MAX_PAGE_SIZE }
      }),
      200,
      `find the '${action}' audit logs`
    );
    return data;
  }

  /** The ids the start-session form suggests to a user with no group: custom ids scoped to the default group. */
  async findDefaultGroupSubjectCustomIds(): Promise<string[]> {
    return this.expectJson<string[]>(
      this.request.get(`${API}/subjects/default-group/custom-ids`, { headers: this.authHeaders }),
      200,
      'find the custom subject ids scoped to the default group'
    );
  }

  /** Reads a group back as admin, to check whether a write by another role actually took effect. */
  async findGroupById(id: string): Promise<Group> {
    return this.expectJson<Group>(
      this.request.get(`${API}/groups/${id}`, { headers: this.authHeaders }),
      200,
      `find group '${id}'`
    );
  }

  /** The id of any instrument of this kind; every group from {@link createGroup} can use it. */
  async findInstrumentId(kind: InstrumentInfo['kind']): Promise<string> {
    const instruments = await this.getInstrumentInfo();
    const instrument = instruments.find((info) => info.kind === kind);
    if (!instrument) {
      throw new Error(`Expected an instrument of kind '${kind}' to be available`);
    }
    return instrument.id;
  }

  /** The id of a seeded instrument, looked up by the internal name its source file declares. */
  async findInstrumentIdByName(name: string): Promise<string> {
    const instruments = await this.expectJson<{ id: string; internal?: { name: string } }[]>(
      this.request.get(`${API}/instruments/info`, { headers: this.authHeaders }),
      200,
      'list instruments'
    );
    const instrument = instruments.find((candidate) => candidate.internal?.name === name);
    if (!instrument) {
      throw new Error(`No instrument named '${name}' among ${instruments.length} returned`);
    }
    return instrument.id;
  }

  /** The ids the start-session form suggests for a group: its subjects identified by a custom id. */
  async findSubjectCustomIds(groupId: string): Promise<string[]> {
    return this.expectJson<string[]>(
      this.request.get(`${API}/subjects/groups/${groupId}/custom-ids`, { headers: this.authHeaders }),
      200,
      `find the custom subject ids of group '${groupId}'`
    );
  }

  /** Reads a user back as admin, to check what a write actually stored. */
  async findUserById(id: string): Promise<User> {
    return this.expectJson<User>(
      this.request.get(`${API}/users/${id}`, { headers: this.authHeaders }),
      200,
      `find user '${id}'`
    );
  }

  /** Emails an assignment's link through the route the web app's send form uses, waiting out the SMTP budget. */
  async sendAssignmentEmail(id: string, data: $SendAssignmentEmailData): Promise<EmailDeliveryResult> {
    return this.expectJson<EmailDeliveryResult>(
      this.request.post(`${API}/assignments/${id}/email`, {
        data,
        headers: this.authHeaders,
        timeout: MAIL_CLIENT_TIMEOUT
      }),
      201,
      `email assignment '${id}'`
    );
  }

  /**
   * Switch outgoing mail on or off instance-wide, (re)seeding {@link E2E_MAIL_CONFIG}. Every
   * caller must switch it back off — `isMailEnabled` is global, and leaving it on changes the UI
   * for every other spec.
   */
  async setMailEnabled(enabled: boolean): Promise<void> {
    await this.expectOk(
      this.request.patch(`${API}/mail/settings`, {
        data: { config: { enabled, ...E2E_MAIL_CONFIG } },
        headers: this.authHeaders
      }),
      `set mail enabled to ${enabled}`
    );
  }

  /**
   * Replaces a user's additional permissions. Permissions are not on the create schema, so seeding
   * a user who holds any is necessarily two calls.
   */
  async setUserPermissions(id: string, permissions: Permissions): Promise<User> {
    return this.expectJson<User>(
      this.request.put(`${API}/users/${id}/permissions`, { data: { permissions }, headers: this.authHeaders }),
      200,
      `set permissions of user '${id}'`
    );
  }

  /** Updates a user's profile fields, which is everything except their permissions. */
  async updateUser(id: string, data: Partial<$UpdateUserData>): Promise<User> {
    const response = await this.request.patch(`${API}/users/${id}`, { data, headers: this.authHeaders });
    if (!response.ok()) {
      throw new Error(`Failed to update user '${id}' (${response.status()}): ${await response.text()}`);
    }
    return (await response.json()) as User;
  }

  /**
   * Bulk-creates one record per entry, and with them the subjects and sessions they name. Returns
   * the records the api reports created, which the upload contract scopes to this request alone.
   */
  async uploadRecords(
    groupId: string,
    instrumentId: string,
    records: UploadRecord[]
  ): Promise<{ subjectId: string }[]> {
    const data: UploadInstrumentRecordsData = { groupId, instrumentId, records };
    return this.expectJson<{ subjectId: string }[]>(
      this.request.post(`${API}/instrument-records/upload`, { data, headers: this.authHeaders }),
      201,
      'upload instrument records'
    );
  }

  private async expectJson<T>(
    pending: ReturnType<APIRequestContext['post']>,
    status: number,
    action: string
  ): Promise<T> {
    const response = await pending;
    if (response.status() !== status) {
      throw new Error(`Failed to ${action} (expected ${status}, got ${response.status()}): ${await response.text()}`);
    }
    return (await response.json()) as T;
  }

  private async expectOk(pending: ReturnType<APIRequestContext['patch']>, action: string): Promise<void> {
    const response = await pending;
    if (!response.ok()) {
      throw new Error(`Failed to ${action} (${response.status()}): ${await response.text()}`);
    }
  }

  private async getAccessibleInstrumentIds(): Promise<string[]> {
    const instruments = await this.getInstrumentInfo();
    return instruments.map((instrument) => instrument.id);
  }

  private async getInstrumentInfo(): Promise<InstrumentInfo[]> {
    return this.expectJson<InstrumentInfo[]>(
      this.request.get(`${API}/instruments/info`, { headers: this.authHeaders }),
      200,
      'list instruments'
    );
  }
}

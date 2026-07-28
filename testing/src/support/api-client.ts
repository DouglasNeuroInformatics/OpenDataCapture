import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import type { CreateGroupData, Group } from '@opendatacapture/schemas/group';
import type { UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';
import type { CreateUserData, User } from '@opendatacapture/schemas/user';
import type { APIRequestContext } from '@playwright/test';

import { SEEDED_USER_PASSWORD } from './constants';
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

  /** Creates a group and grants it access to every available instrument, so seeded users can use them. */
  async createGroup(overrides: Partial<CreateGroupData> = {}): Promise<Group> {
    const data: CreateGroupData = { name: `Group ${randomId()}`, type: 'CLINICAL', ...overrides };
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

  /** Creates a user (GROUP_MANAGER by default) and returns the login credentials for it. */
  async createUser(overrides: Partial<CreateUserData> = {}): Promise<{ credentials: $LoginCredentials; user: User }> {
    const username = overrides.username ?? `user_${randomId()}`;
    const password = overrides.password ?? SEEDED_USER_PASSWORD;
    const data: CreateUserData = {
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

  /**
   * Bulk-creates one record per entry, and with them the subjects and sessions they name. This is the
   * cheapest way to give a subject an instrument record: the export only carries subjects that have
   * one.
   */
  async uploadRecords(groupId: string, instrumentId: string, records: UploadRecord[]): Promise<void> {
    const data: UploadInstrumentRecordsData = { groupId, instrumentId, records };
    await this.expectJson(
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
    const instruments = await this.expectJson<{ id: string }[]>(
      this.request.get(`${API}/instruments/info`, { headers: this.authHeaders }),
      200,
      'list instruments'
    );
    return instruments.map((instrument) => instrument.id);
  }
}

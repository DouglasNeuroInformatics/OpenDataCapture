import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import type { CreateGroupData, Group } from '@opendatacapture/schemas/group';
import type { CreateUserData, User } from '@opendatacapture/schemas/user';
import type { APIRequestContext } from '@playwright/test';

import { E2E_MAIL_CONFIG, SEEDED_USER_PASSWORD } from './constants';
import { randomId } from './unique';

const API = '/api/v1';

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

  /** Reads a group back as admin, to check whether a write by another role actually took effect. */
  async findGroupById(id: string): Promise<Group> {
    return this.expectJson<Group>(
      this.request.get(`${API}/groups/${id}`, { headers: this.authHeaders }),
      200,
      `find group '${id}'`
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

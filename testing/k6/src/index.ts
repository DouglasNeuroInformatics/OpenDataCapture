import { DEMO_USERS } from '@opendatacapture/demo';
import type { AuthPayload, LoginCredentials } from '@opendatacapture/schemas/auth';
import type { Group } from '@opendatacapture/schemas/group';
import type { SetupState } from '@opendatacapture/schemas/setup';
import type { Summary } from '@opendatacapture/schemas/summary';
import { check, sleep } from 'k6';
import { isMatch, random } from 'lodash-es';

import { Client } from './client';
import { Config } from './config';

export const options = new Config('smoke');

export default function () {
  const client = new Client({
    baseUrl: 'https://demo.opendatacapture.org'
  });
  const user = DEMO_USERS[random(DEMO_USERS.length - 1)];

  // check single page app
  check(client.get('/', { headers: { Accept: 'text/html' } }), {
    'the status code is 200': (res) => res.status === 200,
    'the title is "Open Data Capture"': (res) => res.html('title').html() === 'Open Data Capture'
  });

  // check the demo is setup
  check(client.get<SetupState>('/api/v1/setup'), {
    'the response body matches the expected structure': (res) => {
      return isMatch(res.json(), {
        isDemo: true,
        isGatewayEnabled: true,
        isSetup: true
      } satisfies SetupState);
    },
    'the status code is 200': (res) => res.status === 200
  });

  // login and get an access token
  const loginResponse = client.post<LoginCredentials, AuthPayload>('/api/v1/auth/login', {
    password: user.password,
    username: user.username
  });
  check(loginResponse, {
    'the access token is not empty': (res) => res.json('accessToken').length > 0,
    'the status code is 200': (res) => res.status === 200
  });

  const accessToken = loginResponse.json('accessToken');
  client.defaultHeaders.common.Authorization = `Bearer ${accessToken}`;

  // select a random group and get the group id
  const groupsResponse = client.get<Omit<Group, 'createdAt' | 'updatedAt'>[]>('/api/v1/groups');
  check(groupsResponse, { 'the status code is 200': (res) => res.status === 200 });
  const groups = groupsResponse.json();
  check(groups, { 'the number of groups is the expected value': (groups) => groups.length === user.groupNames.length });
  const selectedGroup = groups[random(groups.length - 1)];

  // get a summary of available data
  check(client.get<Summary>(`/api/v1/summary?groupId=${selectedGroup.id}`), {
    'the number of users is greater than zero': (res) => res.json('counts').users > 0,
    'the status code is 200': (res) => res.status === 200
  });

  sleep(3);
}

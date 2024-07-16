import { DEMO_USERS } from '@opendatacapture/demo';
import type { AuthPayload, LoginCredentials } from '@opendatacapture/schemas/auth';
import type { Group } from '@opendatacapture/schemas/group';
import type { InstrumentSummary } from '@opendatacapture/schemas/instrument';
import type { SetupState } from '@opendatacapture/schemas/setup';
import type { Subject } from '@opendatacapture/schemas/subject';
import type { Summary } from '@opendatacapture/schemas/summary';
import { check, sleep } from 'k6';
import { isMatch, random } from 'lodash-es';

import { Client, type ClientParams } from './client';
import { Config, type ConfigParams } from './config';

// these are injected via the build script during transpilation
declare global {
  const __CONFIG_PARAMS: ConfigParams;
  const __CLIENT_PARAMS: ClientParams;
}

const GROUP_MANAGERS = DEMO_USERS.filter((user) => user.basePermissionLevel === 'GROUP_MANAGER');

export const options = new Config(__CONFIG_PARAMS);

export default function () {
  const client = new Client(__CLIENT_PARAMS);
  const user = GROUP_MANAGERS[random(GROUP_MANAGERS.length - 1)];

  // check single page app
  // this is currently disabled since we need to test the API alone locally
  // check(client.get('/', { headers: { Accept: 'text/html' } }), {
  //   'the status code is 200': (res) => res.status === 200,
  //   'the title is "Open Data Capture"': (res) => res.html('title').html() === 'Open Data Capture'
  // });

  // check the demo is setup
  const setupResponse = client.get<SetupState>('/v1/setup');
  check(setupResponse, {
    'the response body matches the expected structure': (res) => {
      return isMatch(res.json(), {
        isDemo: true,
        isSetup: true
      } satisfies Partial<SetupState>);
    },
    'the status code is 200': (res) => res.status === 200
  });
  const isGatewayEnabled = setupResponse.json('isGatewayEnabled');

  sleep(0.5);

  // login and get an access token
  const loginResponse = client.post<LoginCredentials, AuthPayload>('/v1/auth/login', {
    password: user.password,
    username: user.username
  });
  check(loginResponse, {
    'the access token is not empty': (res) => res.json('accessToken').length > 0,
    'the status code is 200': (res) => res.status === 200
  });

  const accessToken = loginResponse.json('accessToken');
  client.defaultHeaders.common.Authorization = `Bearer ${accessToken}`;

  sleep(0.5);

  // select a random group and get the group id
  const groupsResponse = client.get<Omit<Group, 'createdAt' | 'updatedAt'>[]>('/v1/groups');
  check(groupsResponse, { 'the status code is 200': (res) => res.status === 200 });
  const groups = groupsResponse.json();
  check(groups, { 'the number of groups is the expected value': (groups) => groups.length === user.groupNames.length });
  const selectedGroup = groups[random(groups.length - 1)];

  sleep(0.5);

  // get a summary of available data
  check(client.get<Summary>(`/v1/summary?groupId=${selectedGroup.id}`), {
    'the number of users is greater than zero': (res) => res.json('counts').users > 0,
    'the status code is 200': (res) => res.status === 200
  });

  sleep(0.5);

  // get all subjects (e.g., when accessing the data hub)
  const subjectsResponse = client.get<Pick<Subject, 'id'>[]>(`/v1/subjects?groupId=${selectedGroup.id}`);
  check(subjectsResponse, {
    'the number of subjects is greater than zero': (res) => res.json().length > 0,
    'the status code is 200': (res) => res.status === 200
  });
  const subjects = subjectsResponse.json();

  sleep(0.5);

  // export all data
  check(
    client.get<any[]>('/v1/instrument-records/export', {
      params: {
        groupId: selectedGroup.id
      }
    }),
    {
      'the number of entries is larger than 100': (res) => res.json().length > 100,
      'the status code is 200': (res) => res.status === 200
    }
  );

  sleep(0.5);

  // view a random subject (x3)
  for (let i = 0; i < 3; i++) {
    const selectedSubject = subjects[random(subjects.length - 1)];

    // view assignments (if gateway enabled)
    if (isGatewayEnabled) {
      check(client.get<any[]>(`/v1/assignments?subjectId=${selectedSubject.id}`), {
        'the status code is 200': (res) => res.status === 200
      });
      sleep(0.5);
    }

    // get summaries
    const instrumentSummariesResponse = client.get<InstrumentSummary[]>(
      `/v1/instruments/summaries?subjectId=${selectedSubject.id}`
    );
    check(instrumentSummariesResponse, { 'the status code is 200': (res) => res.status === 200 });
    const instrumentSummaries = instrumentSummariesResponse.json();

    sleep(0.5);

    // for each summary, get the full instrument and all records for this subject
    for (const summary of instrumentSummaries) {
      check(client.get(`/v1/instruments/${summary.id}`), {
        'the status code is 200': (res) => res.status === 200
      });
      check(
        client.get('/v1/instrument-records', {
          params: {
            groupId: selectedGroup.id,
            instrumentId: summary.id,
            subjectId: selectedSubject.id
          }
        }),
        {
          'the status code is 200': (res) => res.status === 200
        }
      );
      sleep(0.5);
    }
  }
}

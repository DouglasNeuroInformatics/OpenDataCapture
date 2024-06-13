import { DEMO_USERS } from '@opendatacapture/demo';
import type { AuthPayload, LoginCredentials } from '@opendatacapture/schemas/auth';
import type { Group } from '@opendatacapture/schemas/group';
import type { InstrumentSummary } from '@opendatacapture/schemas/instrument';
import type { SetupState } from '@opendatacapture/schemas/setup';
import type { Subject } from '@opendatacapture/schemas/subject';
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

  sleep(0.5);

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

  sleep(0.5);

  // select a random group and get the group id
  const groupsResponse = client.get<Omit<Group, 'createdAt' | 'updatedAt'>[]>('/api/v1/groups');
  check(groupsResponse, { 'the status code is 200': (res) => res.status === 200 });
  const groups = groupsResponse.json();
  check(groups, { 'the number of groups is the expected value': (groups) => groups.length === user.groupNames.length });
  const selectedGroup = groups[random(groups.length - 1)];

  sleep(0.5);

  // get a summary of available data
  check(client.get<Summary>(`/api/v1/summary?groupId=${selectedGroup.id}`), {
    'the number of users is greater than zero': (res) => res.json('counts').users > 0,
    'the status code is 200': (res) => res.status === 200
  });

  sleep(0.5);

  // get all subjects (e.g., when accessing the data hub)
  const subjectsResponse = client.get<Pick<Subject, 'id'>[]>(`/api/v1/subjects?groupId=${selectedGroup.id}`);
  check(subjectsResponse, {
    'the number of subjects is greater than zero': (res) => res.json().length > 0,
    'the status code is 200': (res) => res.status === 200
  });
  const subjects = subjectsResponse.json();

  sleep(0.5);

  // export all data
  check(
    client.get<any[]>('/api/v1/instrument-records/export', {
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
    check(client.get<any[]>(`/api/v1/assignments?subjectId=${selectedSubject.id}`), {
      'the status code is 200': (res) => res.status === 200
    });
    sleep(0.5);

    // get summaries
    const instrumentSummariesResponse = client.get<InstrumentSummary[]>(
      `/api/v1/instruments/summaries?subjectId=${selectedSubject.id}`
    );
    check(instrumentSummariesResponse, { 'the status code is 200': (res) => res.status === 200 });
    const instrumentSummaries = instrumentSummariesResponse.json();

    sleep(0.5);

    // for each summary, get the full instrument and all records for this subject
    for (const summary of instrumentSummaries) {
      check(client.get(`/api/v1/instruments/${summary.id}`), {
        'the status code is 200': (res) => res.status === 200
      });
      check(
        client.get('/api/v1/instrument-records', {
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

import { DEMO_USERS } from '@opendatacapture/demo';
import type { LoginCredentials } from '@opendatacapture/schemas/auth';
import type { SetupState } from '@opendatacapture/schemas/setup';
import { check, sleep } from 'k6';
import type { RefinedResponse } from 'k6/http';
import { isMatch, random } from 'lodash-es';

import { Client } from './client';
import { Config } from './config';

export const options = new Config('smoke');

export default function () {
  const client = new Client({
    baseUrl: 'https://demo.opendatacapture.org'
  });
  const user = DEMO_USERS[random(DEMO_USERS.length - 1)];

  let res: RefinedResponse<'text'>;

  // check single page app
  res = client.get('/', { headers: { Accept: 'text/html' } });
  check(res, {
    'the response body includes the expected title': (req) => {
      return Boolean(req.body?.includes('<title>Open Data Capture</title>'));
    },
    'the status code is 200': (res) => res.status === 200
  });

  // check the demo is setup
  res = client.get('/api/v1/setup');
  check(res, {
    'the response body matches the expected structure': (res) =>
      isMatch(res.json() as object, {
        isDemo: true,
        isGatewayEnabled: true,
        isSetup: true
      } satisfies SetupState),
    'the status code is 200': (res) => res.status === 200
  });

  // login and get an access token
  res = client.post(
    '/api/v1/auth/login',
    {
      password: user.password,
      username: user.username
    } satisfies LoginCredentials,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  check(res, {
    'the access token is a non-empty string': (res) => {
      const accessToken = res.json('accessToken');
      return typeof accessToken === 'string' && accessToken.length > 0;
    },
    'the status code is 200': (res) => res.status === 200
  });

  const accessToken = res.json('accessToken') as string;
  client.defaultHeaders.common.Authorization = `Bearer ${accessToken}`;

  // select a random group and get the group id
  // const groupName = user.groupNames[random(user.groupNames.length - 1)];
  // res = client.get('/api/v1/groups');
  // check(res, {
  //   'the number of groups is the same as the number of expected groups': (res) => {
  //     return (res.json() as any[]).length === user.groupNames.length;
  //   },
  //   'the status code is 200': (res) => res.status === 200
  // });
  // const groups
  // const selectedGroup =

  // get a summary of available data
  res = client.get('/api/v1/summary');
  check(res, {
    'the response body includes an object for the counts property': (res) => {
      const counts = res.json('counts');
      return Boolean(counts && typeof counts === 'object');
    },
    'the status code is 200': (res) => res.status === 200
  });
  sleep(3);
}

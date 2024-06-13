import { DEMO_USERS } from '@opendatacapture/demo';
import type { LoginCredentials } from '@opendatacapture/schemas/auth';
// import type { Group } from '@opendatacapture/schemas/group';
import type { SetupState } from '@opendatacapture/schemas/setup';
import { check, sleep } from 'k6';
import * as http from 'k6/http';
import { isMatch, random } from 'lodash-es';

import { Config } from './config';

const BASE_URL = 'https://demo.opendatacapture.org';

export const options = new Config('smoke');

export default function () {
  let accessToken: string;
  //let group: Group;

  const user = DEMO_USERS[random(DEMO_USERS.length - 1)];

  // check single page app
  {
    const res = http.get<'text'>(BASE_URL, {
      headers: {
        Accept: 'text/html'
      }
    });
    check(res, {
      'the response body includes the expected title': (req) => {
        return Boolean(req.body?.includes('<title>Open Data Capture</title>'));
      },
      'the status code is 200': (res) => res.status === 200
    });
  }

  // check the demo is setup
  {
    const res = http.get<'text'>(`${BASE_URL}/api/v1/setup`, {
      headers: {
        Accept: 'application/json'
      }
    });
    check(res, {
      'the response body matches the expected structure': (res) =>
        isMatch(res.json() as object, {
          isDemo: true,
          isGatewayEnabled: true,
          isSetup: true
        } satisfies SetupState),
      'the status code is 200': (res) => res.status === 200
    });
  }

  // login and get an access token
  {
    const res = http.post(
      `${BASE_URL}/api/v1/auth/login`,
      JSON.stringify({
        password: user.password,
        username: user.username
      } satisfies LoginCredentials),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    check(res, { 'the status code is 200': (res) => res.status === 200 });
    accessToken = res.json('accessToken') as string;
    check(accessToken, {
      'the access token is a non-empty string': (accessToken) => {
        return typeof accessToken === 'string' && accessToken.length > 0;
      }
    });
  }

  // select a random group and get the group id
  {
    // const groupName = user.groupNames[random(user.groupNames.length - 1)];
    const res = http.get<'text'>(`${BASE_URL}/api/v1/groups`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });
    check(res, {
      'the number of groups is the same as the number of expected groups': (res) => {
        return (res.json() as any[]).length === user.groupNames.length;
      },
      'the status code is 200': (res) => res.status === 200
    });
  }

  // get a summary of available data
  {
    const res = http.get(`${BASE_URL}/api/v1/summary`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });
    check(res, {
      'the response body includes an object for the counts property': (res) => {
        const counts = res.json('counts');
        return Boolean(counts && typeof counts === 'object');
      },
      'the status code is 200': (res) => res.status === 200
    });
  }
  sleep(3);
}

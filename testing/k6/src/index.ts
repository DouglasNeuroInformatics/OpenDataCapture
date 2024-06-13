import { check, sleep } from 'k6';
import * as http from 'k6/http';
import type { RefinedResponse } from 'k6/http';
import type { Options } from 'k6/options';

const MAX_TARGET_USERS = 1;
const BASE_URL = 'https://demo.opendatacapture.org';

export const options: Options = {
  duration: '3s',
  thresholds: {
    checks: ['rate == 1'] // 100% of checks must pass
  },
  vus: MAX_TARGET_USERS
  // stages: [
  //   {
  //     duration: '30s', // traffic ramp-up from 1 to MAX_TARGET users
  //     target: MAX_TARGET
  //   },
  //   {
  //     duration: '1m', // stay at MAX_TARGET users
  //     target: MAX_TARGET
  //   },
  //   {
  //     duration: '30s', // ramp-down to 0 users
  //     target: 0
  //   }
  // ]
};

export default function () {
  let res: RefinedResponse<'text' | undefined>;

  // check the single page app
  res = http.get(BASE_URL);
  check(res, {
    'the response body includes the expected title': (req) => {
      return Boolean(req.body?.includes('<title>Open Data Capture</title>'));
    },
    'the status code is 200': (res) => res.status === 200
  });

  // check the demo is setup
  res = http.get(`${BASE_URL}/api/v1/setup`);
  check(res, {
    'the response body contains the app status': (res) => {
      return ['isDemo', 'isGatewayEnabled', 'isSetup'].every((key) => res.json(key) === true);
    },
    'the status code is 200': (res) => res.status === 200
  });

  // login and get an access token
  res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({
      password: 'DataCapture2023',
      username: 'JaneDoe'
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  check(res, { 'the status code is 200': (res) => res.status === 200 });
  const accessToken = res.json('accessToken') as string;
  check(accessToken, {
    'the access token is a non-empty string': (accessToken) => {
      return typeof accessToken === 'string' && accessToken.length > 0;
    }
  });

  res = http.get(`${BASE_URL}/api/v1/summary`, {
    headers: {
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

  sleep(3);
}

import { describe, expect, it } from 'vitest';

import { $Env } from '../env.schema';

/** Every variable a test environment requires, as the raw strings `process.env` would hold. */
const testEnv = {
  GATEWAY_API_KEY: 'a'.repeat(32),
  GATEWAY_ENABLED: 'true',
  GATEWAY_REFRESH_INTERVAL: '10000',
  MONGO_URI: 'mongodb://localhost:27017',
  NODE_ENV: 'test',
  SECRET_KEY: 'b'.repeat(32)
};

const storageEnv = {
  STORAGE_ACCESS_KEY: 'access',
  STORAGE_BUCKET: 'bucket',
  STORAGE_ENABLED: 'true',
  STORAGE_ENDPOINT: 'http://localhost:9000',
  STORAGE_SECRET_KEY: 'secret'
};

const issueMessages = (input: { [key: string]: string }) =>
  $Env.safeParse(input).error?.issues.map(({ message }) => message) ?? [];

describe('$Env', () => {
  it('should listen on port 80 when no dev server port is set, which is what the production container exposes', () => {
    expect($Env.parse(testEnv).API_PORT).toBe(80);
  });

  it('should listen on the dev server port when one is set', () => {
    expect($Env.parse({ ...testEnv, API_DEV_SERVER_PORT: '5500' }).API_PORT).toBe(5500);
  });

  it('should require a gateway site address in production, since assignment links are built from it', () => {
    expect(issueMessages({ ...testEnv, NODE_ENV: 'production' })).toContain(
      'GATEWAY_SITE_ADDRESS must be defined in production'
    );
  });

  it('should accept a production environment that defines the gateway site address', () => {
    const result = $Env.safeParse({
      ...testEnv,
      GATEWAY_SITE_ADDRESS: 'https://gateway.example.org',
      NODE_ENV: 'production'
    });
    expect(result.success).toBe(true);
  });

  it('should require a dev server port in development, since the dev proxy targets it', () => {
    expect(issueMessages({ ...testEnv, NODE_ENV: 'development' })).toContain(
      'API_DEV_SERVER_PORT must be defined in development'
    );
  });

  it('should accept a development environment that defines the dev server port', () => {
    expect($Env.safeParse({ ...testEnv, API_DEV_SERVER_PORT: '5500', NODE_ENV: 'development' }).success).toBe(true);
  });

  it('should accept enabled storage when every required storage variable is set', () => {
    expect($Env.safeParse({ ...testEnv, ...storageEnv }).success).toBe(true);
  });

  it('should name each storage variable missing while storage is enabled, so startup reports all of them at once', () => {
    const issues = $Env.safeParse({ ...testEnv, STORAGE_ENABLED: 'true' }).error?.issues ?? [];
    expect(issues.map(({ path }) => path)).toStrictEqual([
      ['STORAGE_ACCESS_KEY'],
      ['STORAGE_BUCKET'],
      ['STORAGE_ENDPOINT'],
      ['STORAGE_SECRET_KEY']
    ]);
  });

  it('should not require storage variables while storage is disabled', () => {
    expect($Env.safeParse({ ...testEnv, STORAGE_ENABLED: 'false' }).success).toBe(true);
  });
});

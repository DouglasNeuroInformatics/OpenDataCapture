import * as http from 'node:http';
import type { AddressInfo } from 'node:net';

import type { ConfigService } from '@douglasneuroinformatics/libnest';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createGatewayHttpOptions } from '../gateway.http';

describe('createGatewayHttpOptions', () => {
  let connectionCount: number;
  let server: http.Server;

  beforeEach(async () => {
    connectionCount = 0;
    server = http.createServer((_, response) => response.end());
    server.on('connection', () => connectionCount++);
    await new Promise<void>((resolve) => server.listen(0, 'localhost', resolve));
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('should open a new connection for every request, so none is sent on one the gateway has closed', async () => {
    const config: { [key: string]: unknown } = {
      GATEWAY_API_KEY: 'api-key',
      GATEWAY_DEV_SERVER_PORT: (server.address() as AddressInfo).port,
      NODE_ENV: 'test'
    };
    const configService = { get: (key: string) => config[key] } as unknown as ConfigService;
    const client = axios.create(createGatewayHttpOptions(configService));

    await client.get('/');
    await client.get('/');

    expect(connectionCount).toBe(2);
  });
});

describe('createGatewayHttpOptions in production', () => {
  const createProductionOptions = (config: { [key: string]: unknown }) => {
    const env: { [key: string]: unknown } = { GATEWAY_API_KEY: 'api-key', NODE_ENV: 'production', ...config };
    const configService = {
      get: (key: string) => env[key],
      getOrThrow: (key: string) => env[key]
    } as unknown as ConfigService;
    return createGatewayHttpOptions(configService);
  };

  it('should reach a gateway on localhost through the internal network, since the site address is unreachable from a container', () => {
    const options = createProductionOptions({
      GATEWAY_INTERNAL_NETWORK_URL: new URL('http://gateway:3500/path'),
      GATEWAY_SITE_ADDRESS: new URL('http://localhost:3500')
    });
    expect(options.baseURL).toBe('http://gateway:3500');
  });

  it('should fall back to the site address on localhost when no internal network url is configured', () => {
    const options = createProductionOptions({ GATEWAY_SITE_ADDRESS: new URL('http://localhost:3500/path') });
    expect(options.baseURL).toBe('http://localhost:3500');
  });

  it('should use the public site address for a gateway that is not on localhost', () => {
    const options = createProductionOptions({
      GATEWAY_INTERNAL_NETWORK_URL: new URL('http://gateway:3500'),
      GATEWAY_SITE_ADDRESS: new URL('https://gateway.example.org/path')
    });
    expect(options.baseURL).toBe('https://gateway.example.org');
  });

  it('should authenticate every request with the gateway api key', () => {
    const options = createProductionOptions({ GATEWAY_SITE_ADDRESS: new URL('https://gateway.example.org') });
    expect(options.headers).toEqual({ Authorization: 'Bearer api-key' });
  });
});

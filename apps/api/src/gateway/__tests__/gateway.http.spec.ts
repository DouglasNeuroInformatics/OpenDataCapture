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

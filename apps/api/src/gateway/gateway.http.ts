import * as http from 'node:http';
import * as https from 'node:https';

import type { ConfigService } from '@douglasneuroinformatics/libnest';
import type { HttpModuleOptions } from '@nestjs/axios';

export function createGatewayHttpOptions(configService: ConfigService): HttpModuleOptions {
  let baseURL: string;
  if (configService.get('NODE_ENV') === 'production') {
    const internalNetworkUrl = configService.get('GATEWAY_INTERNAL_NETWORK_URL');
    const siteAddress = configService.getOrThrow('GATEWAY_SITE_ADDRESS');
    if (siteAddress.hostname === 'localhost' && internalNetworkUrl) {
      baseURL = internalNetworkUrl.origin;
    } else {
      baseURL = siteAddress.origin;
    }
  } else {
    const gatewayPort = configService.get('GATEWAY_DEV_SERVER_PORT');
    baseURL = `http://localhost:${gatewayPort}`;
  }
  return {
    baseURL,
    headers: {
      Authorization: `Bearer ${configService.get('GATEWAY_API_KEY')}`
    },
    // Node's default agent reuses idle connections, and the gateway's server closes one after five
    // idle seconds. When that close lands while the API's event loop is busy, the API sends its next
    // request on the dead connection and it fails with ECONNRESET, so every request gets its own.
    httpAgent: new http.Agent({ keepAlive: false }),
    httpsAgent: new https.Agent({ keepAlive: false })
  };
}

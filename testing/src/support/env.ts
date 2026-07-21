import { parseNumber } from '@douglasneuroinformatics/libjs';

function requiredPort(name: string): number {
  const value = parseNumber(process.env[name]);
  if (Number.isNaN(value)) {
    throw new Error(`Expected ${name} to be a number, got ${process.env[name]}`);
  }
  return value;
}

export const apiPort = requiredPort('API_DEV_SERVER_PORT');
export const gatewayPort = requiredPort('GATEWAY_DEV_SERVER_PORT');
export const webPort = requiredPort('WEB_DEV_SERVER_PORT');

// Tests run against the web origin; vite proxies `/api` through to the API server.
export const baseURL = `http://localhost:${webPort}`;

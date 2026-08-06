import { parseNumber } from '@douglasneuroinformatics/libjs';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Expected ${name} to be set, got ${value}`);
  }
  return value;
}

function requiredPort(name: string): number {
  const value = parseNumber(process.env[name]);
  if (Number.isNaN(value)) {
    throw new Error(`Expected ${name} to be a number, got ${process.env[name]}`);
  }
  return value;
}

// Read straight from the same `.env` apps/web builds `config.meta.contactEmail` from: a developer's
// value differs from the `.env.template` one CI generates, so a literal here only passes locally.
export const contactEmail = required('CONTACT_EMAIL');

// The credential the API itself presents to the gateway. A test needs it to put the gateway into a
// state the API cannot reach on its own — namely, having forgotten an assignment this instance
// still holds.
export const gatewayApiKey = required('GATEWAY_API_KEY');

export const apiPort = requiredPort('API_DEV_SERVER_PORT');
export const gatewayPort = requiredPort('GATEWAY_DEV_SERVER_PORT');
export const webPort = requiredPort('WEB_DEV_SERVER_PORT');

// Tests run against the web origin; vite proxies `/api` through to the API server.
export const baseURL = `http://localhost:${webPort}`;

import { parseNumber } from '@douglasneuroinformatics/libjs';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Expected ${name} to be set, got ${value}`);
  }
  return value;
}

function requiredNumber(name: string): number {
  const value = parseNumber(process.env[name]);
  if (Number.isNaN(value)) {
    throw new Error(`Expected ${name} to be a number, got ${process.env[name]}`);
  }
  return value;
}

// Read straight from the same `.env` apps/web builds `config.meta.contactEmail` from: a developer's
// value differs from the `.env.template` one CI generates, so a literal here only passes locally.
export const contactEmail = required('CONTACT_EMAIL');

export const apiPort = requiredNumber('API_DEV_SERVER_PORT');
export const gatewayPort = requiredNumber('GATEWAY_DEV_SERVER_PORT');
export const playgroundPort = requiredNumber('PLAYGROUND_DEV_SERVER_PORT');
export const webPort = requiredNumber('WEB_DEV_SERVER_PORT');

/** How often, in milliseconds, the API pulls completed assignments from the gateway. */
export const gatewayRefreshInterval = requiredNumber('GATEWAY_REFRESH_INTERVAL');

// Tests run against the web origin; vite proxies `/api` through to the API server.
export const baseURL = `http://localhost:${webPort}`;

// The patient-facing gateway is its own origin; assignment links point here.
export const gatewayURL = `http://localhost:${gatewayPort}`;

// The playground is its own static site with no backend; its specs navigate here by absolute URL.
export const playgroundURL = `http://localhost:${playgroundPort}`;

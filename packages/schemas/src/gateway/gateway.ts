import { z } from 'zod/v4';

import { $ActiveLanguages } from '../core/core.js';
import { $ReleaseInfo } from '../setup/setup.js';

/**
 * The instance-level state the gateway needs in order to render an assignment, pushed by `apps/api`
 * on every synchronization pass. Deliberately a projection of `SetupState` rather than the whole
 * shape: the rest of it either describes the API's own process (`release`, `uptime`) or gates UI the
 * gateway does not have, and the gateway is reachable from outside the instance's network, so it
 * should hold only what it renders.
 */
export type RemoteSetupState = z.infer<typeof $RemoteSetupState>;
export const $RemoteSetupState = z.object({
  activeLanguages: $ActiveLanguages
});

export type GatewayHealthcheckSuccessResult = z.infer<typeof $GatewayHealthcheckSuccessResult>;
export const $GatewayHealthcheckSuccessResult = z.object({
  ok: z.literal(true),
  release: $ReleaseInfo,
  status: z.literal(200),
  uptime: z.number()
});

export type GatewayHealthcheckFailureResult = z.infer<typeof $GatewayHealthcheckFailureResult>;
export const $GatewayHealthcheckFailureResult = z.object({
  ok: z.literal(false),
  status: z.number(),
  statusText: z.string()
});

export type GatewayHealthcheckResult = z.infer<typeof $GatewayHealthcheckResult>;
export const $GatewayHealthcheckResult = z.discriminatedUnion('ok', [
  $GatewayHealthcheckSuccessResult,
  $GatewayHealthcheckFailureResult
]);

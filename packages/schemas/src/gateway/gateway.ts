import { z } from 'zod';

import { $ReleaseInfo } from '../setup/setup';

export type GatewayHealthcheckSuccessResult = z.infer<typeof $GatewayHealthcheckSuccessResult>;
export const $GatewayHealthcheckSuccessResult = z.object({
  ok: z.literal(true),
  releaseInfo: $ReleaseInfo,
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
export const $GatewayHealthcheckResult = z.union([$GatewayHealthcheckSuccessResult, $GatewayHealthcheckFailureResult]);

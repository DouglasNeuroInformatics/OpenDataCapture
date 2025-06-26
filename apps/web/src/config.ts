import { $BooleanLike, deepFreeze } from '@douglasneuroinformatics/libjs';
import { z } from 'zod/v4';

const $Config = z.object({
  analytics: z
    .object({
      plausibleBaseUrl: z.string().min(1),
      plausibleDataDomain: z.string().min(1)
    })
    .optional(),
  dev: z.object({
    disableTutorial: $BooleanLike.optional(),
    isBypassAuthEnabled: $BooleanLike.optional(),
    isForceClearQueryCacheEnabled: $BooleanLike.optional(),
    networkLatency: z.coerce.number().int().nonnegative().optional(),
    password: z.string().min(1).optional(),
    username: z.string().min(1).optional()
  }),
  meta: z.object({
    contactEmail: z.email(),
    docsUrl: z.url(),
    githubRepoUrl: z.url(),
    licenseUrl: z.url()
  }),
  setup: z.object({
    apiBaseUrl: z.string().min(1),
    isGatewayEnabled: $BooleanLike
  })
});

export const config = await $Config
  .parseAsync({
    analytics:
      import.meta.env.PLAUSIBLE_BASE_URL && import.meta.env.PLAUSIBLE_WEB_DATA_DOMAIN
        ? {
            plausibleBaseUrl: import.meta.env.PLAUSIBLE_BASE_URL,
            plausibleDataDomain: import.meta.env.PLAUSIBLE_WEB_DATA_DOMAIN
          }
        : undefined,
    dev: {
      disableTutorial: import.meta.env.VITE_DEV_DISABLE_TUTORIAL,
      isBypassAuthEnabled: import.meta.env.VITE_DEV_BYPASS_AUTH,
      isForceClearQueryCacheEnabled: import.meta.env.VITE_DEV_FORCE_CLEAR_QUERY_CACHE,
      networkLatency: import.meta.env.VITE_DEV_NETWORK_LATENCY,
      password: import.meta.env.VITE_DEV_PASSWORD,
      username: import.meta.env.VITE_DEV_USERNAME
    },
    meta: {
      contactEmail: import.meta.env.CONTACT_EMAIL,
      docsUrl: import.meta.env.DOCS_URL,
      githubRepoUrl: import.meta.env.GITHUB_REPO_URL,
      licenseUrl: import.meta.env.LICENSE_URL
    },
    setup: {
      apiBaseUrl: import.meta.env.API_BASE_URL,
      isGatewayEnabled: import.meta.env.GATEWAY_ENABLED
    }
  })
  .then(deepFreeze);

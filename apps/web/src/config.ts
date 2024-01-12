import { $BooleanString } from '@open-data-capture/common/core';
import { z } from 'zod';

const $Config = z.object({
  dev: z.object({
    isBypassAuthEnabled: $BooleanString.optional(),
    password: z.string().min(1).optional(),
    username: z.string().min(1).optional()
  }),
  meta: z.object({
    contactEmail: z.string().email(),
    docsUrl: z.string().url(),
    githubRepoUrl: z.string().url(),
    licenseUrl: z.string().url()
  }),
  setup: z.object({
    apiBaseUrl: z.string().url(),
    isGatewayEnabled: $BooleanString
  })
});

console.log('eval config');

export const config = $Config.parse({
  dev: {
    isBypassAuthEnabled: import.meta.env.VITE_DEV_BYPASS_AUTH,
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
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    isGatewayEnabled: import.meta.env.GATEWAY_ENABLED
  }
});

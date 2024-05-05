import type { SetupState } from '@opendatacapture/schemas/setup';
import { HttpResponse, http } from 'msw';

export const setupHandlers = [
  http.get('/v1/setup', () => {
    return HttpResponse.json<SetupState>({
      isDemo: false,
      isGatewayEnabled: false,
      isSetup: true
    });
  })
];

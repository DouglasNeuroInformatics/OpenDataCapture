import type { SetupState } from '@open-data-capture/common/setup';
import { HttpResponse, http } from 'msw';

export const setupHandlers = [
  http.get('/v1/setup', () => {
    return HttpResponse.json<SetupState>({
      isGatewayEnabled: false,
      isSetup: true
    });
  })
];

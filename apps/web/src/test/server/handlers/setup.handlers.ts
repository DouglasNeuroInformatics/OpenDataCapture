import type { SetupStatus } from '@open-data-capture/common/setup';
import { HttpResponse, http } from 'msw';

export const setupHandlers = [
  http.get('/v1/setup', () => {
    return HttpResponse.json<SetupStatus>({
      isSetup: true
    });
  })
];

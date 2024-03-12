import type { Summary } from '@open-data-capture/common/summary';
import { HttpResponse, http } from 'msw';

export const summaryHandlers = [
  http.get('v1/summary', () => {
    return HttpResponse.json<Summary>({
      counts: {
        instruments: 5,
        records: 20,
        subjects: 10,
        users: 10
      }
    });
  })
];

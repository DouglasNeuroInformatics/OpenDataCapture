import type { Visit } from '@open-data-capture/common/visit';
import { HttpResponse, http } from 'msw';

import { testSubject } from '../stubs';

export const VisitHandler = [
  http.post('/v1/visits', () => {
    return HttpResponse.json<Visit>({
      date: new Date('2023-11-14'),
      group: undefined,
      id: '12345',
      subject: testSubject
    });
  })
];

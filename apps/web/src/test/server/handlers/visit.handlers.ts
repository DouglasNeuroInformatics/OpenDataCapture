import type { Visit } from '@open-data-capture/common/visit';
import { HttpResponse, http } from 'msw';

import { testSubject } from '../stubs';

export const visitHandler = [
  http.post('/v1/visits', () => {
    return HttpResponse.json<Visit>({
      createdAt: new Date(),
      date: new Date('2000-11-14'),
      groupId: '1',
      id: '12345',
      subject: testSubject,
      subjectId: '1',
      updatedAt: new Date()
    });
  })
];

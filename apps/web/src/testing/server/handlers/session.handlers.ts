import type { Session } from '@opendatacapture/schemas/session';
import { HttpResponse, http } from 'msw';

import { testSubject } from '../stubs';

export const sessionHandlers = [
  http.post('/v1/sessions', () => {
    return HttpResponse.json<Session>({
      createdAt: new Date(),
      date: new Date('2000-11-14'),
      groupId: '1',
      id: '12345',
      subject: testSubject,
      subjectId: '1',
      type: 'IN_PERSON',
      updatedAt: new Date()
    });
  })
];

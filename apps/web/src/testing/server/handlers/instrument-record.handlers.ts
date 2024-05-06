import { HttpHandler, HttpResponse, http } from 'msw';

export const instrumentRecordHandlers: HttpHandler[] = [
  http.post('/v1/instrument-records', () => {
    return HttpResponse.json({});
  })
];

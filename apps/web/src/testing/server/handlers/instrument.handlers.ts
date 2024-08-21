import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import type { InstrumentBundleContainer, InstrumentInfo } from '@opendatacapture/schemas/instrument';
import { http, HttpHandler, HttpResponse } from 'msw';

export const instrumentHandlers: HttpHandler[] = [
  http.get('/v1/instruments/info', () => {
    return HttpResponse.json<InstrumentInfo[]>([
      unilingualFormInstrument.instance,
      bilingualFormInstrument.instance,
      interactiveInstrument.instance
    ]);
  }),
  http.get(`/v1/instruments/${unilingualFormInstrument.instance.id}`, () => {
    return HttpResponse.json<InstrumentBundleContainer>({
      bundle: unilingualFormInstrument.bundle,
      id: unilingualFormInstrument.instance.id
    });
  }),
  http.get(`/v1/instruments/${bilingualFormInstrument.instance.id}`, () => {
    return HttpResponse.json<InstrumentBundleContainer>({
      bundle: bilingualFormInstrument.bundle,
      id: bilingualFormInstrument.instance.id
    });
  }),
  http.get(`/v1/instruments/${interactiveInstrument.instance.id}`, () => {
    return HttpResponse.json<InstrumentBundleContainer>({
      bundle: interactiveInstrument.bundle,
      id: interactiveInstrument.instance.id
    });
  })
];

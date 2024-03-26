import { InstrumentInterpreter } from '@opendatacapture/instrument-interpreter';
import type { Json } from '@opendatacapture/schemas/core';

const interpreter = new InstrumentInterpreter();

window.addEventListener('message', (event: MessageEvent<{ payload: string; type: string }>) => {
  const done = (data: Json) => {
    window.parent.document.dispatchEvent(new CustomEvent('done', { detail: data }));
  };
  const bundle = event.data.payload;
  void interpreter
    .interpret(bundle, { kind: 'INTERACTIVE' })
    .then((instrument) => {
      instrument.content.assets?.css?.forEach((stylesheet) => {
        document.head.insertAdjacentHTML('beforeend', `<style>${stylesheet}</style>`);
        console.log(stylesheet);
      });
      instrument.content.render(done);
    })
    .catch(console.error);
});

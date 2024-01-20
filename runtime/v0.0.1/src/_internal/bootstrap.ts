import { InstrumentInterpreter } from '@open-data-capture/instrument-interpreter';

const interpreter = new InstrumentInterpreter();

window.addEventListener('message', (event: MessageEvent<{ payload: string; type: string }>) => {
  const bundle = event.data.payload;
  void interpreter
    .interpret(bundle, { kind: 'INTERACTIVE' })
    .then((instrument) => {
      instrument.content.assets?.css?.forEach((stylesheet) => {
        document.head.insertAdjacentHTML('beforeend', `<style>${stylesheet}</style>`);
        console.log(stylesheet);
      });
      instrument.content.render();
    })
    .catch(console.error);
});

import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { InstrumentShowcase } from './InstrumentShowcaseV2';
function createDummyInstrument(n) {
  return {
    identifier: n.toString(),
    kind: 'form',
    name: 'MyInstrument' + n,
    tags: ['foo'],
    version: 1.0,
    details: {
      title: 'My Instrument ' + n,
      description: 'This is my instrument',
      language: n % 2 ? 'en' : 'fr',
      instructions: 'Please complete all questions',
      estimatedDuration: 15
    }
  };
}
var instruments = [];
for (var i = 0; i < 10; i++) {
  instruments.push(createDummyInstrument(i));
}
instruments[0].tags.push('other');
export default {
  args: {
    instruments: instruments
  },
  decorators: [
    function (Story) {
      return React.createElement(
        MemoryRouter,
        null,
        React.createElement('div', { className: 'container' }, React.createElement(Story, null))
      );
    }
  ],
  component: InstrumentShowcase
};
export var Default = {};

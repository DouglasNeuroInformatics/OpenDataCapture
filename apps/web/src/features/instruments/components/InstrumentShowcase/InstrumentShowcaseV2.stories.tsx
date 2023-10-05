import type { FormInstrumentSummary } from '@open-data-capture/types';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { InstrumentShowcase } from './InstrumentShowcaseV2';

type Story = StoryObj<typeof InstrumentShowcase>;

function createDummyInstrument(n: number): FormInstrumentSummary {
  return {
    details: {
      description: 'This is my instrument',
      estimatedDuration: 15,
      instructions: 'Please complete all questions',
      language: n % 2 ? 'en' : 'fr',
      title: 'My Instrument ' + n
    },
    identifier: n.toString(),
    kind: 'form',
    name: 'MyInstrument' + n,
    tags: ['foo'],
    version: 1.0
  };
}

const instruments: FormInstrumentSummary[] = [];
for (let i = 0; i < 10; i++) {
  instruments.push(createDummyInstrument(i));
}
instruments[0]!.tags.push('other');

export default {
  args: {
    instruments
  },
  component: InstrumentShowcase,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="container">
          <Story />
        </div>
      </MemoryRouter>
    )
  ]
} as Meta<typeof InstrumentShowcase>;

export const Default: Story = {};

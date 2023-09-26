import type { FormInstrumentSummary } from '@open-data-capture/types';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

import { InstrumentShowcase } from './InstrumentShowcase';

type Story = StoryObj<typeof InstrumentShowcase>;

function createDummyInstrument(n: number): FormInstrumentSummary {
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

const instruments: FormInstrumentSummary[] = [];
for (let i = 0; i < 10; i++) {
  instruments.push(createDummyInstrument(i));
}

export default {
  args: {
    instruments
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="container">
          <Story />
        </div>
      </MemoryRouter>
    )
  ],
  component: InstrumentShowcase
} as Meta<typeof InstrumentShowcase>;

export const Default: Story = {};

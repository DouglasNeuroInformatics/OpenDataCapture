import { Card } from '@douglasneuroinformatics/libui/components';
import { bilingualFormInstrument, unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { interactiveInstrument } from '@opendatacapture/instrument-stubs/interactive';
import { seriesInstrument } from '@opendatacapture/instrument-stubs/series';
import type { Meta, StoryObj } from '@storybook/react';

import { InstrumentRenderer } from './InstrumentRenderer';

type Story = StoryObj<typeof InstrumentRenderer>;

export default {
  component: InstrumentRenderer,
  decorators: [
    (Story) => {
      return (
        <Card className="mx-auto w-screen max-w-3xl p-6">
          <Story />
        </Card>
      );
    }
  ],
  parameters: {
    layout: 'centered'
  }
} as Meta<typeof InstrumentRenderer>;

export const UnilingualForm: Story = {
  args: {
    target: {
      bundle: unilingualFormInstrument.bundle,
      kind: 'SCALAR'
    }
  }
};

export const BilingualForm: Story = {
  args: {
    target: {
      bundle: bilingualFormInstrument.bundle,
      kind: 'SCALAR'
    }
  }
};

export const Interactive: Story = {
  args: {
    target: {
      bundle: interactiveInstrument.bundle,
      kind: 'SCALAR'
    }
  }
};

export const Series: Story = {
  args: {
    target: {
      bundle: seriesInstrument.bundle,
      items: [],
      kind: 'SERIES'
    }
  }
};

import type { Meta, StoryObj } from '@storybook/react';

import { InstrumentCard } from './InstrumentCard';

type Story = StoryObj<typeof InstrumentCard>;

import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';

export default { component: InstrumentCard } as Meta<typeof InstrumentCard>;

export const Default: Story = {
  args: {
    instrument: unilingualFormInstrument.instance,
    onClick: () => alert('Click!')
  }
};

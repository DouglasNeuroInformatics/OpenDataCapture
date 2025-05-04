import { Card } from '@douglasneuroinformatics/libui/components';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import type { AnyUnilingualInstrument } from '@opendatacapture/runtime-core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { cloneDeep, merge } from 'lodash-es';

import { InstrumentOverview } from './InstrumentOverview';
type Story = StoryObj<typeof InstrumentOverview>;

export default { component: InstrumentOverview } as Meta<typeof InstrumentOverview>;

export const Default: Story = {
  args: {
    instrument: merge(cloneDeep(unilingualFormInstrument.instance), {
      details: {
        referenceUrl: 'https://github.com/DouglasNeuroInformatics/OpenDataCapture',
        sourceUrl: 'https://github.com/DouglasNeuroInformatics/OpenDataCapture'
      }
    }) as AnyUnilingualInstrument
  },
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
};

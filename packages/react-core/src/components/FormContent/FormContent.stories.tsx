import { Card } from '@douglasneuroinformatics/libui/components';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { FormContent } from './FormContent';

type Story = StoryObj<typeof FormContent>;

export default { component: FormContent } as Meta<typeof FormContent>;

export const Default: Story = {
  args: {
    instrument: unilingualFormInstrument.instance as AnyUnilingualFormInstrument
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

import { InstrumentInterpreter } from '@open-data-capture/instrument-interpreter';
import { clickTask } from '@open-data-capture/instrument-library';
import type { Meta, StoryObj } from '@storybook/react';

import { InteractiveContent } from './InteractiveContent';

type Story = StoryObj<typeof InteractiveContent>;

const interpreter = new InstrumentInterpreter();

const instrument = await interpreter.interpret(clickTask.bundle, { kind: 'INTERACTIVE' });

export default { component: InteractiveContent } as Meta<typeof InteractiveContent>;

export const ClickTask: Story = {
  args: {
    instrument
  }
};
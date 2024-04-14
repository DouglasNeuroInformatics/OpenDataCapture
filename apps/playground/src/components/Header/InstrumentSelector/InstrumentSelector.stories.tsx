import type { Meta, StoryObj } from '@storybook/react';

import { InstrumentSelector } from './InstrumentSelector';

type Story = StoryObj<typeof InstrumentSelector>;

export default { component: InstrumentSelector } as Meta<typeof InstrumentSelector>;

export const Default: Story = {};

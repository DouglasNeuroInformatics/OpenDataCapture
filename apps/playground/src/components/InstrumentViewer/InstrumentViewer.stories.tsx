import type { Meta, StoryObj } from '@storybook/react';

import { InstrumentViewer } from './InstrumentViewer';

type Story = StoryObj<typeof InstrumentViewer>;

export default { component: InstrumentViewer } as Meta<typeof InstrumentViewer>;

export const Default: Story = {};

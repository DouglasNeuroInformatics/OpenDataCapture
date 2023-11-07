import type { Meta, StoryObj } from '@storybook/react';

import { ErrorFallback } from './ErrorFallback';

type Story = StoryObj<typeof ErrorFallback>;

export default { component: ErrorFallback } satisfies Meta<typeof ErrorFallback>;

export const Default: Story = {};

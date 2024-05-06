import type { Meta, StoryObj } from '@storybook/react';

import { ContactForm } from './ContactForm';

type Story = StoryObj<typeof ContactForm>;

export default { component: ContactForm } as Meta<typeof ContactForm>;

export const Default: Story = {};
